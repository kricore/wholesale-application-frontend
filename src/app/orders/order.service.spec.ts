import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { OrdersResponse } from '../cart/order.dto';
import { environment } from 'src/environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get orders from backend', () => {
    const mockResponse: OrdersResponse[] = [
      { id: '1', name: 'Order 1' } as unknown as OrdersResponse,
      { id: '2', name: 'Order 2' } as unknown as OrdersResponse,
    ];

    service.getOrdersFromBackend();

    const req = httpMock.expectOne(`${environment.api}/api/orders`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);

    expect(service.orders).toEqual(mockResponse);
  });
});
