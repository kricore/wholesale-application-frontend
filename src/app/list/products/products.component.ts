import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductVariation, SingleProductResponse } from '../products.dto';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  constructor(private productService: ProductsService) {}
  public products: Observable<Product[]> = this.productService.getProducts$();
  public selectedVariations: ProductVariation[] = [];
  public popupClass: string = 'product__popup';
  public selectedProductId: string = '';

  ngOnInit(): void {
    this.productService.loadProducts();
  }

  /**
   * Handle the click from the entire product DOM element
   * set the popup's content and open the popup
   *
   * @param product
   */
  handleProductClickEvent(product: Product) {
    this.getProductVariations(product);
  }

  /**
   * Reset the popup's content
   */
  closePopup() {
    this.selectedVariations = [];
    this.popupClass = 'product__popup';

    document.body.classList.remove('stay_fixed');
    document.documentElement.classList.remove('stay_fixed');
  }

  openPopup(){
    this.popupClass = 'product__popup opened';
    document.body.classList.add('stay_fixed');
    document.documentElement.classList.add('stay_fixed');
  }

  /**
   * Construct the variation for the product's
   * individual cart
   *
   * @param product
   * @returns
   */
  getProductVariations(product: Product): void {
    this.productService
      .getProductVariationsById(product.id)
      .subscribe((response: SingleProductResponse) => {
        const variations: ProductVariation[] = [];
        this.productService.getVariation(response, variations);
        this.selectedVariations = variations;
        this.selectedProductId = product.id;
        this.openPopup();
      });
  }
}
