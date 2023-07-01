import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductsService } from './products.service';
import { environment } from 'src/environments/environment';
import { Product, ProductVariation, ProductsResponse, SingleProductResponse } from './products.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // afterEach(() => {
  //   httpMock.verify();
  // });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load products', () => {
    const mockResponse: ProductsResponse = {
      data: [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ],
    } as unknown as ProductsResponse;

    service.loadProducts();

    const req = httpMock.expectOne(`${environment.api}/api/products`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);

    expect(service.products).toEqual(mockResponse.data);
  });

  it('should get product variations by id', () => {
    const productId = '1';
    const mockResponse: SingleProductResponse = {
      data: {
        id: '1',
        name: 'Product 1',
        variants: [
          { id: '1', name: 'Variant 1' } as unknown as ProductVariation,
          { id: '2', name: 'Variant 2' } as unknown as ProductVariation,
        ],
      } as unknown as Product,
    };

    service.getProductVariationsById(productId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.api}/api/product/${productId}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should get variations', () => {
    const mockProduct: SingleProductResponse = {
      data: {
        id: '1',
        name: 'Product 1',
        variants: [
          { id: '1', name: 'Variant 1', price: 0, description: '', title: 'Variant 1' },
          { id: '2', name: 'Variant 2', price: 0, description: '', title: 'Variant 2' },
        ],
      },
    } as unknown as SingleProductResponse;
    const mockVariations: ProductVariation[] = [];

    service.getVariation(mockProduct, mockVariations);

    expect(mockVariations).toEqual([
      {
        title: 'Variant 1',
        featuredImage: null,
        price: 0,
        description: '',
        quantity: 1,
        id: '1',
      },
      {
        title: 'Variant 2',
        featuredImage: null,
        price: 0,
        description: '',
        quantity: 1,
        id: '2',
      },
    ]);
  });
});
