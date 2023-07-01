import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  retry,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrdersResponse } from '../cart/order.dto';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  orders: OrdersResponse[] = [];
  ordersChanged = new BehaviorSubject<OrdersResponse[]>([]);

  /**
   * Load all of the available products
   * on the component's load
   */
  getOrdersFromBackend(): Subscription {
    const url = `${environment.api}/api/orders`;
    return this.http
      .get<OrdersResponse[]>(url)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.orders = [...response];
          this.ordersChanged.next(this.orders.slice());
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() =>
            `${error}:: Unable to connect to the server. Please try again later.`
          );
        }
      });
  }

  getOrders(): Observable<OrdersResponse[]> {
    return this.ordersChanged.asObservable();
  }
}
