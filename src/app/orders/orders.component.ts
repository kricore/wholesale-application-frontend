import { Component, OnInit } from '@angular/core';
import { OrderService } from './order.service';
import { Observable } from 'rxjs';
import { OrdersResponse } from '../cart/order.dto';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  public orders: Observable<OrdersResponse[]> = this.orderService.getOrders();

  constructor(
    public orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.orderService.getOrdersFromBackend();
  }
}
