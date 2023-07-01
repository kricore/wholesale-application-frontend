import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { CartService } from '../cart/shared/cart.service';
import { AuthService } from '../shared/auth.service';
import { Observable, of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let cartService: CartService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: CartService,
          useValue: {
            getTotalItems: jasmine.createSpy('getTotalItems').and.returnValue(5),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin$: jasmine.createSpy('isAdmin$'),
            isAuthenticated: of(true),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    authService = TestBed.inject(AuthService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('getCartIndicator', () => {
    it('should return the total items if the user is authenticated', () => {
      const result = component.getCartIndicator();

      expect(result).toBe(5);
      expect(cartService.getTotalItems).toHaveBeenCalled();
    });
  });
});
