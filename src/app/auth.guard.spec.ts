import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthGuard, Token } from './auth.guard';
import { AuthService } from './shared/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpClientTestingModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: AuthService
        },
      ],
      imports: [HttpClientTestingModule],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpClientTestingModule);
  });

  describe('canActivate', () => {
    it('should return true if the token is valid', () => {
      spyOn(localStorage, 'getItem').and.returnValue('valid_token');
      spyOn(authService, 'isTokenValid').and.returnValue(true);
      spyOn(authService, 'logout');


      const result = guard.canActivate(undefined, undefined);

      expect(result).toBeTrue();
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(authService.isTokenValid).toHaveBeenCalledWith('valid_token');
      expect(router.navigate).not.toHaveBeenCalled();
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should return false and navigate to /login if the token is invalid', () => {
      spyOn(localStorage, 'getItem').and.returnValue('invalid_token');
      spyOn(authService, 'isTokenValid').and.returnValue(false);
      spyOn(authService, 'logout');

      const result = guard.canActivate(undefined, undefined);

      expect(result).toBeFalse();
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(authService.isTokenValid).toHaveBeenCalledWith('invalid_token');
    });

    it('should return false and navigate to /login if there is no token', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      spyOn(authService, 'logout');
      spyOn(authService, 'isTokenValid');

      const result = guard.canActivate(undefined, undefined);

      expect(result).toBeFalse();
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(authService.isTokenValid).not.toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('isTokenValidWithRedirect', () => {
    it('should return true if the token is valid', () => {
      spyOn(authService, 'isTokenValid').and.returnValue(true);

      const result = guard.isTokenValidWithRedirect('valid_token');

      expect(result).toBeTrue();
      expect(authService.isTokenValid).toHaveBeenCalledWith('valid_token');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false and navigate to /login if the token is invalid', () => {
      spyOn(authService, 'isTokenValid').and.returnValue(false);

      const result = guard.isTokenValidWithRedirect('invalid_token');

      expect(result).toBeFalse();
      expect(authService.isTokenValid).toHaveBeenCalledWith('invalid_token');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
