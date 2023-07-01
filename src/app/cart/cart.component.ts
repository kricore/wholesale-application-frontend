import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import CartItem from './cart.model';
import { CartService } from './shared/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  constructor(public cartService: CartService) {}

  cartItems: Observable<CartItem[]> = this.cartService.getItems();
  message: string | null = null;

  ngOnInit(): void {}

  decreaseQuantity(id: number): void {
    this.cartService.decreaseQuantity(id);
  }

  increaseQuantity(id: number): void {
    this.cartService.increaseQuantity(id);
  }

  removeItem(i: number): void {
    this.cartService.removeFromCart(i);
  }

  /**
   * Finalize the order, clear the cart and notify the user
   */
  async finalizeOrder(): Promise<void> {
    if (this.cartService.cartItems?.length === 0) {
      this.message = `Your cart is empty`;
      return;
    }
    try{
      const payload = await this.cartService.createOrderPayload();
      if (payload) {
        this.cartService.placeOrder(payload).subscribe({
          next: (res: any) => {
            console.log(res);
            this.message = `Your order has been placed. ${res._id}`;
            this.cartService.clearCart();
          },
          error: (err: HttpErrorResponse) => {
            this.message = `Failed to place order`;
            console.error('Failed to place order:', err);
          },
        });
      } else {
        this.message = 'Βρέθηκαν σφάλματα στην παραγγελία σας';
      }
    }
    catch(e){
      console.log(e);
      this.message = 'Βρέθηκαν σφάλματα στην παραγγελία σας';
    }
  }
}
