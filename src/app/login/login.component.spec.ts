import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        {
          provide: AuthService,        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to products if user is authenticated', () => {
    spyOn(authService, 'isUserAuthenticated').and.returnValue(true);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalled();
  });

  it('should set error message if login fails with 404 or 401 status', () => {
    const email = 'test@example.com';
    const password = 'password';

    const errorResponse = new HttpErrorResponse({ status: 404 });
    spyOn(authService, 'login').and.returnValue(throwError(errorResponse));

    component.loginForm.get('email')?.setValue(email);
    component.loginForm.get('password')?.setValue(password);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(email, password);
    expect(component.errorMessage).toBe('Τα στοιχεία δεν σωστά');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set error message if login fails with other error status', () => {
    const email = 'test@example.com';
    const password = 'password';

    const errorResponse = new HttpErrorResponse({ status: 500 });
    spyOn(authService, 'login').and.returnValue(throwError(errorResponse));

    component.loginForm.get('email')?.setValue(email);
    component.loginForm.get('password')?.setValue(password);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(email, password);
    expect(component.errorMessage).toBe('Κάτι πήγε στραβά κατά την σύνδεση');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to products if login succeeds', () => {
    const email = 'test@example.com';
    const password = 'password';
    spyOn(authService, 'login').and.returnValue(of({"accessToken": ''}));

    component.loginForm.get('email')?.setValue(email);
    component.loginForm.get('password')?.setValue(password);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(email, password);
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
