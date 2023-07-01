import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { CartService } from './shared/cart.service';
import { Observable, of } from 'rxjs';
import CartItem from './cart.model';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdersPayload } from './order.dto';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: CartService,
          // useValue: {
          //   getItems: jasmine.createSpy('getItems').and.returnValue(of([])),
          //   decreaseQuantity: jasmine.createSpy('decreaseQuantity'),
          //   increaseQuantity: jasmine.createSpy('increaseQuantity'),
          //   removeFromCart: jasmine.createSpy('removeFromCart'),
          //   createOrderPayload: jasmine.createSpy('createOrderPayload').and.returnValue(Promise.resolve({})),
          //   placeOrder: jasmine.createSpy('placeOrder').and.returnValue(of({ _id: 'order-id' })),
          //   clearCart: jasmine.createSpy('clearCart'),
          //   getTotalCost: jasmine.createSpy('getTotalCost')
          // },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cart service to decrease quantity', () => {
    const itemId = 1;
    spyOn(cartService, 'decreaseQuantity');
    component.decreaseQuantity(itemId);
    expect(cartService.decreaseQuantity).toHaveBeenCalledWith(itemId);
  });

  it('should call cart service to increase quantity', () => {
    const itemId = 1;
    spyOn(cartService, 'increaseQuantity');
    component.increaseQuantity(itemId);
    expect(cartService.increaseQuantity).toHaveBeenCalledWith(itemId);
  });

  it('should call cart service to remove item from cart', () => {
    const index = 1;
    spyOn(cartService, 'removeFromCart');

    component.removeItem(index);
    expect(cartService.removeFromCart).toHaveBeenCalledWith(index);
  });

  it('should set error message if cart is empty during order finalization', async () => {
    spyOn(cartService, 'createOrderPayload');
    spyOn(cartService, 'placeOrder');
    spyOn(cartService, 'clearCart');

    await component.finalizeOrder();

    expect(component.message).toBe('Your cart is empty');
    expect(cartService.createOrderPayload).not.toHaveBeenCalled();
    expect(cartService.placeOrder).not.toHaveBeenCalled();
    expect(cartService.clearCart).not.toHaveBeenCalled();
  });

  it('should set error message if order payload creation fails', async () => {
    spyOn(cartService, 'getItems').and.returnValue(
      of([{ id: 1, quantity: 2 } as unknown as CartItem])
    );
    cartService.cartItems = [{ id: 1, quantity: 2 } as unknown as CartItem];
    const errorMessage = 'Error creating order payload';
    spyOn(cartService, 'createOrderPayload').and.returnValue(
      Promise.reject(errorMessage)
    );
    spyOn(cartService, 'placeOrder');
    spyOn(cartService, 'clearCart');

    await component.finalizeOrder();

    expect(component.message).toBe('Βρέθηκαν σφάλματα στην παραγγελία σας');
    expect(cartService.createOrderPayload).toHaveBeenCalled();
    expect(cartService.placeOrder).not.toHaveBeenCalled();
    expect(cartService.clearCart).not.toHaveBeenCalled();
  });

  it('should place the order and clear the cart on successful order placement', async () => {
    spyOn(cartService, 'getItems').and.returnValue(
      of([{ id: 1, quantity: 2 } as unknown as CartItem])
    );
    cartService.cartItems = [{ id: 1, quantity: 2 } as unknown as CartItem];

    const orderPayload = { items: [{ id: 1, quantity: 2 }] };
    spyOn(cartService, 'createOrderPayload').and.returnValue(
      Promise.resolve(orderPayload as unknown as OrdersPayload)
    );
    spyOn(cartService, 'placeOrder').and.returnValue(
      of({
        _id: 9,
      })
    );
    spyOn(cartService, 'clearCart');

    await component.finalizeOrder();

    expect(component.message).toBe('Your order has been placed. 9');
    expect(cartService.createOrderPayload).toHaveBeenCalled();
    expect(cartService.placeOrder).toHaveBeenCalledWith(
      orderPayload as unknown as OrdersPayload
    );
    expect(cartService.clearCart).toHaveBeenCalled();
  });

  it('should set error message on order placement failure', async () => {
    spyOn(cartService, 'getItems').and.returnValue(
      of([{ id: 1, quantity: 2 } as unknown as CartItem])
    );
    spyOn(cartService, 'clearCart');
    cartService.cartItems = [{ id: 1, quantity: 2 } as unknown as CartItem];

    const orderPayload = { items: [{ id: 1, quantity: 2 }] };
    spyOn(cartService, 'createOrderPayload').and.returnValue(
      Promise.resolve(orderPayload as unknown as OrdersPayload)
    );

    const errorMessage = 'Error placing the order';

    spyOn(cartService, 'placeOrder').and.returnValue(
      new Observable((observer) => {
        observer.error(
          new HttpErrorResponse({ status: 500, statusText: errorMessage })
        );
      })
    );

    await component.finalizeOrder();

    expect(component.message).toBe('Failed to place order');
    expect(cartService.createOrderPayload).toHaveBeenCalled();
    expect(cartService.placeOrder).toHaveBeenCalledWith(
      orderPayload as unknown as OrdersPayload
    );
    expect(cartService.clearCart).not.toHaveBeenCalled();
  });
});
