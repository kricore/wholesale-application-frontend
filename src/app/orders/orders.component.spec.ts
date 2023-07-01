import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders.component';
import { OrderService } from './order.service';
import { Observable, of } from 'rxjs';
import { OrdersResponse } from '../cart/order.dto';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let orderService: OrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrdersComponent],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getOrders: jasmine.createSpy('getOrders').and.returnValue(of([])),
            getOrdersFromBackend: jasmine.createSpy('getOrdersFromBackend'),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getOrdersFromBackend on ngOnInit', () => {
    component.ngOnInit();

    expect(orderService.getOrdersFromBackend).toHaveBeenCalled();
  });
});
