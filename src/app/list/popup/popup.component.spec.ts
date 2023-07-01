import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { CartService } from 'src/app/cart/shared/cart.service';
import { ProductPopup } from '../products.dto';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  let cartService: CartService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupComponent],
      providers: [CartService],
      imports: [ HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should decrease the quantity if variation exists and quantity > 1', () => {
    const id = '1';
    component.variations = [
      { id: '1', quantity: 2 } as unknown as ProductPopup,
    ];

    component.decreaseQuantity(id);
    expect(component.variations[0].quantity).toBe(1);
  });

  it('should not decrease the quantity if variation does not exist', () => {
    const id = '1';
    component.variations = [];

    component.decreaseQuantity(id);
    expect(component.variations).toEqual([]);
  });

  it('should not decrease the quantity if variation quantity is 1', () => {
    const id = '1';
    component.variations = [
      { id: '1', quantity: 1 } as unknown as ProductPopup,
    ];

    component.decreaseQuantity(id);

    expect(component.variations[0].quantity).toBe(1);
  });

  it('should increase the quantity if variation exists', () => {
    const id = '1';
    component.variations = [
      { id: '1', quantity: 2 } as unknown as ProductPopup,
    ];

    component.increaseQuantity(id);
    expect(component.variations[0].quantity).toBe(3);
  });

  it('should not increase the quantity if variation does not exist', () => {
    const id = '1';
    component.variations = [];

    component.increaseQuantity(id);
    expect(component.variations).toEqual([]);
  });

  it('should generate a UUID', () => {
    const uuid = component.generateUUID();

    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should add the cart item to the cart service', () => {
    const variation = {
      id: '1',
      price: 10,
      title: 'Product 1',
      quantity: 2,
      featuredImage: 'image.jpg',
      description: 'Description',
    };

    spyOn(cartService, 'addToCart');
    component.addToCart(variation);
    expect(cartService.addToCart).toHaveBeenCalled();
  });
});
