import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductsComponent } from './products.component';
import { ProductsService } from '../products.service';
import {
  Product,
  ProductVariation,
  SingleProductResponse,
} from '../products.dto';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productsService: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent],
      providers: [ProductsService],
      imports: [ HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productsService = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Spy on the productService methods
    spyOn(productsService, 'getProducts$').and.returnValue(of([]));
    spyOn(productsService, 'loadProducts');
    spyOn(productsService, 'getProductVariationsById').and.returnValue(
      of({} as unknown as SingleProductResponse)
    );
    spyOn(productsService, 'getVariation');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the products', () => {
    component.ngOnInit();
    expect(productsService.loadProducts).toHaveBeenCalled();
  });

  it('should get product variations and open the popup', () => {
    const product: Product = {
      id: '1',
      name: 'Product 1',
    } as unknown as Product;

    component.handleProductClickEvent(product);

    expect(productsService.getProductVariationsById).toHaveBeenCalledWith(
      product.id
    );
    expect(productsService.getVariation).toHaveBeenCalled();
    expect(component.selectedVariations).toBeDefined();
    expect(component.selectedProductId).toBe(product.id);
    expect(component.popupClass).toBe('product__popup opened');
  });

  it('should reset the popup content', () => {
    component.closePopup();
    expect(component.selectedVariations).toEqual([]);
    expect(component.popupClass).toBe('product__popup');
  });

  it('should set the popupClass to "product__popup opened"', () => {
    component.openPopup();
    expect(component.popupClass).toBe('product__popup opened');
  });

  it('should get product variations and set selected variations and productId', () => {
    const product: Product = {
      id: '1',
      name: 'Product 1',
    } as unknown as Product;
    const response: SingleProductResponse = {} as SingleProductResponse;

    component.getProductVariations(product);

    expect(productsService.getProductVariationsById).toHaveBeenCalledWith(
      product.id
    );
    expect(productsService.getVariation).toHaveBeenCalled();
    expect(component.selectedVariations).toBeDefined();
    expect(component.selectedProductId).toBe(product.id);
  });
});
