import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import CartItem from 'src/app/cart/cart.model';
import { ProductPopup } from '../products.dto';
import { v4 as uuidv4 } from 'uuid';
import { CartService } from 'src/app/cart/shared/cart.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit {
  constructor(private cartService: CartService) {}
  @Input() variations: ProductPopup[] = [];
  @Input() id: string = '';
  @Output() closeEvent = new EventEmitter<boolean>();

  ngOnInit(): void {}

  decreaseQuantity(id: string): void {
    const variation = this.variations.find((vari) => vari.id === id);

    if (!!variation && variation.quantity > 1) {
      variation.quantity = variation.quantity - 1;
    }
  }

  increaseQuantity(id: string): void {
    const variation = this.variations.find((vari) => vari.id === id);
    if (!!variation) {
      variation.quantity = variation.quantity + 1;
    }
  }

  generateUUID() {
    return uuidv4();
  }

  /**
   * Construct the cart item, add a uuid
   * and add it to the cart
   *
   * @param variation
   */
  addToCart(variation: ProductPopup): void {

    variation.message = 'Product added to cart';

    /**
      public readonly price: number,
      public readonly title: string,
      public quantity: number,
      public image: string,
      public readonly id: string
     */
    const cartItem = new CartItem(
      variation.price,
      variation.title,
      variation.quantity,
      variation.featuredImage,
      variation.id,
      variation.description,
      this.generateUUID(),
      this.id,
      ''
    );
    this.cartService.addToCart(cartItem);
  }
}
