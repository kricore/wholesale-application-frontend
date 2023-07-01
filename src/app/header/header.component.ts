import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart/shared/cart.service';
import { AuthService } from '../shared/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    protected router: Router,
    protected authService: AuthService,
    private cartService: CartService
  ) {}

  protected showAdminMenu: Observable<boolean> = this.authService.isAdmin$();

  ngOnInit(): void {}

  getCartIndicator(): number | void {
    if (this.authService.isAuthenticated) {
      return this.cartService.getTotalItems();
    }
  }
}
