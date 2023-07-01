import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, firstValueFrom, take } from 'rxjs';
import CartItem from '../cart.model';
import { Order, OrdersPayload, VerificationResponse } from '../order.dto';
import { AuthService } from 'src/app/shared/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProductsService } from 'src/app/list/products.service';
import { Product, ProductVariation } from 'src/app/list/products.dto';
import { v4 as uuidv4 } from 'uuid';

interface LocalStorageCartItem {
  i: string;
  q: number;
  pId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private productsService: ProductsService
  ) {
    this.initialize();
  }

  cartItems: CartItem[] = [];
  itemsChanged = new BehaviorSubject<CartItem[]>([]);
  hasInitialized = false;

  /**
   * Traverse the localstorage item
   * and set all the stored items in the cart
   *
   * Get all available variations and then based on the id
   * create a valid cart item and add it to the cart
   *
   * No prices or other metadata are being stored in the locastorage
   * in order to avoid tampering
   */
  initialize() {
    const items = localStorage.getItem('resume');
    if (!!items) {
      const historyItems: string[] = items.split('//$$//%%');
      const localItems = historyItems.map((h) => JSON.parse(h));
      this.checkCartItems(localItems);
    }

    this.hasInitialized = true;
  }

  /**
   * Check all the stored cart items
   * against the mongo db cache
   *
   * @param items
   */
  checkCartItems(items: LocalStorageCartItem[]) {
    for (const item of items) {
      const parentProductId = item.pId;
      this.productsService
        .getProductVariationsById(parentProductId)
        ?.toPromise()
        .then((product) => {
          const variation = product?.data?.variants?.find((v) => v.id === item.i);
          if (!!variation) {
            const cartItem = this.createCartItemFromStorage(
              variation,
              item.q,
              item.pId
            );
            this.addToCartFromStorage(cartItem);
          }
        });
    }
  }

  generateUUID() {
    return uuidv4();
  }

  /**
   * Only an id is stored and the quantity
   * Construct a new cart item based on the
   * variation and that quantity
   *
   * @param variation
   * @param quantity
   * @returns
   */
  createCartItemFromStorage(
    variation: ProductVariation,
    quantity: number,
    parentProductId: string
  ): CartItem {
    return new CartItem(
      variation.price,
      variation.title,
      quantity,
      variation.featuredImage,
      variation.id,
      variation.description,
      this.generateUUID(),
      parentProductId,
      ''
    );
  }

  getItems(): Observable<CartItem[]> {
    return this.itemsChanged.asObservable();
  }

  getItemsChanged() {
    return this.itemsChanged.asObservable();
  }

  addToCart(item: CartItem) {
    this.cartItems.unshift(item);
    this.itemsChanged.next(this.cartItems.slice());
    this.updateLocalstorage();
  }

  addToCartFromStorage(item: CartItem) {
    this.cartItems.push(item);
    this.itemsChanged.next(this.cartItems.slice());
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    this.itemsChanged.next(this.cartItems.slice());
    this.updateLocalstorage();
  }

  increaseQuantity(index: number) {
    this.cartItems[index].quantity = this.cartItems[index].quantity + 1;
    this.itemsChanged.next(this.cartItems.slice());
    this.updateLocalstorage();
  }

  decreaseQuantity(index: number) {
    const quantity = this.cartItems[index].quantity;
    if (quantity >= 2) {
      this.cartItems[index].quantity = quantity - 1;
    }
    this.itemsChanged.next(this.cartItems.slice());
    this.updateLocalstorage();
  }

  /**
   * Also updates the localstorage
   */
  clearCart() {
    this.cartItems = [];
    this.itemsChanged.next(this.cartItems.slice());
    localStorage.setItem('resume', '');
  }

  /**
   * Same formula items * quantity
   *
   * @returns
   */
  getTotalCost(): number {
    let sum = 0;
    this.cartItems.forEach((cartItem) => {
      const price = isNaN(cartItem.price)
        ? 0
        : cartItem.price * cartItem.quantity;
      sum = sum + price;
    });
    return sum;
  }

  getTotalItems() {
    return this.cartItems.length;
  }

  /**
   * Create the payload as per the contract
   * with the middleware
   *
   * @returns
   */
  async createOrderPayload(): Promise<OrdersPayload | null> {
    const timestamp = new Date().valueOf();
    const user = this.authService.User;
    const isOrderOK = await this.verifyOrder();
    if (isOrderOK) {
      return {
        items: this.cartItems.map((item: CartItem): Order => {
          return {
            user: user,
            productTitle: item.title,
            productId: item.guid,
            quantity: item.quantity,
            userId: user,
            price: item.price * item.quantity,
          };
        }),
        totalItems: this.getTotalItems(),
        totalPrice: this.getTotalCost(),
        datePlaced: timestamp, // in milliseconds
        user: this.authService.User,
      };
    } else {
      return null;
    }
  }

  /**
   * Before sending the order make sure to verify it
   * in order to avoid discreptancies
   */
  async verifyOrder(): Promise<boolean> {
    const items = this.cartItems.map((item: CartItem) => item);
    const response$ = this.http.post<VerificationResponse>(
      `${environment.api}/api/verify-order`,
      { items }
    );
    try {
      const verification = await firstValueFrom(response$);
      if (verification.items.length) {
        verification.items.forEach((item) => {
          const cartItem = this.cartItems.find(
            (c: CartItem) => c.guid === item.id
          );
          if (cartItem) {
            cartItem.price = item.newPrice;
            cartItem.errorMessage = `Η τιμή έχει αλλάξει η νέα τιμή είναι ${item.newPrice}`;
          }
        });
        return false;
      } else {
        return true;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Place the order in the middleware
   * and have it drive the email notifications
   */
  placeOrder(payload: OrdersPayload): Observable<any> {
    return this.http.post(`${environment.api}/api/order`, payload);
  }

  /**
   * Store it in the localstorage so the cart is persistant
   * Store only the variation id and the quantity
   */
  updateLocalstorage() {
    const items = this.cartItems.map((c) => {
      return JSON.stringify({
        i: c.id,
        q: c.quantity,
        pId: c.pId,
      });
    });
    localStorage.setItem('resume', items.join('//$$//%%'));
  }
}
