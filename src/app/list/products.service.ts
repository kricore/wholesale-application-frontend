import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, retry, throwError } from 'rxjs';
import { Product, ProductsResponse, ProductVariation, SingleProductResponse } from './products.dto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  products: Product[] = [];
  productsChanged = new BehaviorSubject<Product[]>([]);

  /**
   * Load all of the available products
   * on the component's load
   */
  loadProducts(): void {
    const url = `${environment.api}/api/products`;

    this.http
      .get<ProductsResponse>(url)
      .pipe(
        retry(3), // Retry the request up to 3 times on failure
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          return throwError(
            'Unable to connect to the server. Please try again later.'
          );
        })
      )
      .subscribe((response: ProductsResponse) => {
        console.log(response);
        this.products = [...response.data];
        this.productsChanged.next(this.products.slice());
      });
  }

  getItems(): Observable<Product[]> {
    return this.productsChanged.asObservable();
  }

  public getProducts$() {
    return this.productsChanged.asObservable();
  }

  /**
   * Get all the variations for a given product
   *
   * @param id
   * @returns
   */
  getProductVariationsById(id: string): Observable<SingleProductResponse> {
    const url = `${environment.api}/api/product/${id}`;
    return this.http.get<SingleProductResponse>(url).pipe(
      retry(3), // Retry the request up to 3 times on failure
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(
          'Unable to connect to the server. Please try again later.'
        );
      })
    );
  }

  /**
   * Get the variations or add the main product
   * instance as a variation
   *
   * @param product
   * @param variations
   */
  getVariation(
    product: SingleProductResponse,
    variations: ProductVariation[]
  ): void {
    product.data.variants.forEach((variant: ProductVariation, i: number) => {
      const { id, title, featuredImage, price, description } = variant;
      variations.push({
        title,
        featuredImage: featuredImage ?? null,
        price,
        description,
        quantity: 1,
        id,
      });
    });
  }
}
