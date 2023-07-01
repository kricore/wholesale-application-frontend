
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import CartItem from '../cart.model';
import { AuthService } from 'src/app/shared/auth.service';
import { HttpClient } from '@angular/common/http';
import { ProductsService } from 'src/app/list/products.service';
import { ProductVariation, SingleProductResponse } from 'src/app/list/products.dto';
import { environment } from 'src/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrdersPayload } from '../order.dto';

describe('CartService', () => {
  let service: CartService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let httpClient: HttpClient;

  beforeEach(() => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['User']);
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    const productsServiceSpyObj = jasmine.createSpyObj('ProductsService', [
      'getProductVariationsById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: AuthService, useValue: authServiceSpyObj },
        { provide: HttpClient },
        { provide: ProductsService, useValue: productsServiceSpyObj },
      ],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CartService);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productsServiceSpy = TestBed.inject(
      ProductsService
    ) as jasmine.SpyObj<ProductsService>;
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize the cart items from local storage if available', () => {
      const localItems: any[] = [
        { i: 'variation1', q: 2, pId: 'product1' },
        { i: 'variation2', q: 3, pId: 'product2' },
      ];
      spyOn(localStorage, 'getItem').and.returnValue(
        JSON.stringify(localItems)
      );
      spyOn(service, 'checkCartItems');
      service.initialize();

      expect(service.checkCartItems).toHaveBeenCalled();
      expect(service.hasInitialized).toBeTrue();
    });
  });

  describe('createCartItemFromStorage', () => {
    it('should create a cart item based on the variation and quantity', () => {
      const variation: ProductVariation = {
        price: 10,
        title: 'Variation 1',
        featuredImage: 'image1.jpg',
        quantity: 1,
        id: 'variation1',
        description: 'Description 1',
      };
      const quantity = 2;
      const parentProductId = 'product1';

      const result = service.createCartItemFromStorage(
        variation,
        quantity,
        parentProductId
      );

      expect(result.price).toBe(10);
      expect(result.title).toBe('Variation 1');
      expect(result.quantity).toBe(2);
      expect(result.id).toBe('variation1');
      expect(result.description).toBe('Description 1');
      expect(result.guid).toBeDefined();
      expect(result.pId).toBe('product1');
      expect(result.errorMessage).toBe('');
    });
  });

  it('should add valid variations to the cart from local storage', async () => {
    const localItems: any[] = [
      { i: 'variation1', q: 2, pId: 'product1' },
      { i: 'variation2', q: 3, pId: 'product2' },
    ];

    const product1: any = {
      data: {
        variants: [
          { id: 'variation1', price: 10, title: 'Variation 1' },
          { id: 'variation2', price: 15, title: 'Variation 2' },
        ],
      },
    };

    productsServiceSpy.getProductVariationsById.and.returnValue(
      of(product1 as unknown as SingleProductResponse));

    await service.checkCartItems(localItems);

    expect(productsServiceSpy.getProductVariationsById).toHaveBeenCalled();
    expect(productsServiceSpy.getProductVariationsById).toHaveBeenCalledWith(
      'product1'
    );
    expect(productsServiceSpy.getProductVariationsById).toHaveBeenCalledWith(
      'product2'
    );
    expect(service.cartItems.length).toBe(2);
    expect(service.cartItems[0].price).toBe(10);
    expect(service.cartItems[0].title).toBe('Variation 1');
    expect(service.cartItems[0].quantity).toBe(2);
    expect(service.cartItems[0].id).toBe('variation1');
    expect(service.cartItems[0].description).toBeUndefined();
    expect(service.cartItems[0].guid).toBeDefined();
    expect(service.cartItems[0].pId).toBe('product1');
    expect(service.cartItems[0].errorMessage).toBe('');

    expect(service.cartItems[1].price).toBe(15);
    expect(service.cartItems[1].title).toBe('Variation 2');
    expect(service.cartItems[1].quantity).toBe(3);
    expect(service.cartItems[1].id).toBe('variation2');
    expect(service.cartItems[1].description).toBeUndefined();
    expect(service.cartItems[1].guid).toBeDefined();
    expect(service.cartItems[1].pId).toBe('product2');
    expect(service.cartItems[1].errorMessage).toBe('');
  });

  it('should not add variations to the cart if they are not found in the database', async () => {
    const localItems: any[] = [
      { i: 'variation1', q: 2, pId: 'product1' },
      { i: 'variation2', q: 3, pId: 'product2' },
    ];

    productsServiceSpy.getProductVariationsById.and.returnValue(
      of({id: 'dd'} as unknown as SingleProductResponse));

    await service.checkCartItems(localItems);

    expect(productsServiceSpy.getProductVariationsById).toHaveBeenCalled();
    expect(service.cartItems.length).toBe(0);
  });

  describe('rest', () => {
    beforeEach(() => {
      spyOn(service, 'initialize');
    });

    it('should add item to cart', () => {
      const cartItem: CartItem = {
        price: 10,
        title: 'Product 1',
        quantity: 1,
        image: 'image-url',
        id: '123',
        description: 'Product description',
      } as unknown as CartItem;

      service.addToCart(cartItem);

      expect(service.cartItems.length).toBe(1);
      expect(service.cartItems[0]).toBe(cartItem);
    });

    it('should verify order and return verification response if there are results', async () => {
      const response = {
        items: [
          { id: '123', guid: '123', newPrice: 60 },
          { id: '456', guid: '456', newPrice: 70 },
        ],
      };
      spyOn(httpClient, 'post').and.returnValue(of(response));

      const cartItems: CartItem[] = [
        { title: 'Product 1', guid: '123', id: '123', quantity: 1, price: 50 } as unknown as CartItem,
        { title: 'Product 2', guid: '456', id: '456', quantity: 1, price: 50 } as unknown as CartItem,
      ];
      service.cartItems = cartItems;

      const result = await service.verifyOrder();

      expect(result).toEqual(false);
      expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/verify-order`, { items: cartItems });
    });

    it('should verify order and return verification response if there are NO results', async () => {
      const response = {
        items: [
        ],
      };
      spyOn(httpClient, 'post').and.returnValue(of(response));

      const cartItems: CartItem[] = [
        { title: 'Product 1', guid: '123', id: '123', quantity: 1, price: 50 } as unknown as CartItem,
        { title: 'Product 2', guid: '456', id: '456', quantity: 1, price: 50 } as unknown as CartItem,
      ];
      service.cartItems = cartItems;

      const result = await service.verifyOrder();

      expect(result).toEqual(true);
      expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/verify-order`, { items: cartItems });
    });

    xit('should handle error when verifying order', async () => {
      spyOn(httpClient, 'post').and.throwError('Error occurred');

      const cartItems: CartItem[] = [
        { title: 'Product 1', guid: '123', quantity: 1, price: 50 } as unknown as CartItem,
      ];
      service.cartItems = cartItems;

      const result = await service.verifyOrder();

      expect(result).toBe(false);
      expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/verify-order`, { items: cartItems });
    });

    it('should update local storage with cart items', () => {
      spyOn(localStorage, 'setItem');

      service.cartItems = [
        { id: '1', quantity: 2, pId: '123' } as unknown as CartItem,
        { id: '2', quantity: 1, pId: '456' } as unknown as CartItem,
      ];

      service.updateLocalstorage();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'resume',
        JSON.stringify({ i: '1', q: 2, pId: '123' }) + '//$$//%%' +
        JSON.stringify({ i: '2', q: 1, pId: '456' })
      );
    });
  });

  it('should create the order payload when order is valid', async () => {
    spyOn(service, 'verifyOrder').and.returnValue(Promise.resolve(true));
    spyOn(service, 'getTotalCost').and.returnValue(35);
    spyOn(service, 'getTotalItems').and.returnValue(3);

    service.cartItems = [
      { title: 'Product 1', guid: '1', quantity: 2, price: 10 } as unknown as CartItem,
      { title: 'Product 2', guid: '2', quantity: 1, price: 15 } as unknown as CartItem,
    ];

    const payload = await service.createOrderPayload();

    expect(service.getTotalCost).toHaveBeenCalledTimes(1);
    expect(service.getTotalItems).toHaveBeenCalledTimes(1);
    expect(payload).toEqual({
      items: [
        {
          user: jasmine.any(Function),
          productTitle: 'Product 1',
          productId: '1',
          quantity: 2,
          userId: jasmine.any(Function),
          price: 20,
        },
        {
          user: jasmine.any(Function),
          productTitle: 'Product 2',
          productId: '2',
          quantity: 1,
          userId: jasmine.any(Function), // this is due to the spy
          price: 15,
        },
      ],
      totalItems: 3,
      totalPrice: 35,
      datePlaced: jasmine.any(Number),
      user: jasmine.any(Function),
    });
  });

  it('should return null when order is not valid', async () => {
    spyOn(service, 'verifyOrder').and.returnValue(Promise.resolve(false));

    service.cartItems = [
      { title: 'Product 1', guid: '1', quantity: 2, price: 10 } as unknown as CartItem,
      { title: 'Product 2', guid: '2', quantity: 1, price: 15 } as unknown as CartItem,
    ];

    const payload = await service.createOrderPayload();

    expect(payload).toBeNull();
  });

  describe('Cart Actions', () => {
    beforeEach(() => {
      spyOn(service, 'updateLocalstorage');
    });

    it('should remove item from cart', () => {
      service.cartItems = [
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
        { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
      ];

      service.removeFromCart(1);

      expect(service.cartItems).toEqual([
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
      ]);
      expect(service.updateLocalstorage).toHaveBeenCalled();
    });

    it('should increase item quantity', () => {
      service.cartItems = [
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
        { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
      ];

      service.increaseQuantity(0);

      expect(service.cartItems[0].quantity).toBe(3);
      expect(service.updateLocalstorage).toHaveBeenCalled();
    });

    it('should decrease item quantity', () => {
      service.cartItems = [
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
        { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
      ];

      service.decreaseQuantity(0);

      expect(service.cartItems[0].quantity).toBe(1);
      expect(service.updateLocalstorage).toHaveBeenCalled();
    });

    it('should not decrease item quantity below 1', () => {
      service.cartItems = [
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
        { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
      ];

      service.decreaseQuantity(0);
      service.decreaseQuantity(0);

      expect(service.cartItems[0].quantity).toBe(1);
      expect(service.updateLocalstorage).toHaveBeenCalled();
    });

    it('should clear the cart', () => {
      service.cartItems = [
        { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
        { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
      ];
      spyOn(localStorage, 'setItem')
      service.clearCart();

      expect(service.cartItems).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('resume', '');
    });

  });

  it('should calculate the total cost of the items', () => {
    service.cartItems = [
      { title: 'Product 1', quantity: 2, price: 10 } as unknown as CartItem,
      { title: 'Product 2', quantity: 1, price: 15 } as unknown as CartItem,
    ];

    const totalCost = service.getTotalCost();

    expect(totalCost).toBe(35);
  });

  it('should place an order', () => {
    const payload = {
      // Provide the necessary properties for the payload
    } as unknown as OrdersPayload;

    spyOn(httpClient, 'post').and.callThrough();

    service.placeOrder(payload);

    expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/order`, payload);
  });

});
