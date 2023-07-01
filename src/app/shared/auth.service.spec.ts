import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService, AuthResponse, USER_ROLES } from './auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Token } from '../auth.guard';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpClientTestingModule;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService,
      {
        provide: HttpClient,
      }],
    });
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpClientTestingModule);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    localStorage.removeItem('access_token');
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('initState', () => {
    it('should set isAdmin to true if the decoded token has the ADMIN role', () => {
      localStorage.setItem('access_token', 'validToken');
      spyOn(authService, 'decodeToken').and.returnValue({
        level: 'ADMIN'
      } as Token);
      spyOn(localStorage, 'getItem').and.returnValue('validToken');
      spyOn(authService.isAdmin, 'next');
      spyOn(authService.isAuthenticated$, 'next');
      spyOn(authService.isAuthenticated$, 'asObservable').and.returnValue(
        new BehaviorSubject<boolean>(false)
      );

      authService.initState();

      expect(authService.decodeToken).toHaveBeenCalledWith('validToken');
      expect(authService.isAdmin.next).toHaveBeenCalledWith(true);
      expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(true);
    });

    it('should set isAuthenticated$ to true if a token exists in localStorage', () => {
      localStorage.setItem('access_token', 'validToken');
      spyOn(localStorage, 'getItem').and.returnValue('validToken');
      spyOn(authService.isAdmin, 'next');
      spyOn(authService.isAuthenticated$, 'next');
      spyOn(authService.isAuthenticated$, 'asObservable').and.returnValue(
        new BehaviorSubject<boolean>(false)
      );
      spyOn(authService, 'decodeToken').and.returnValue({
        level: 'USER'
      } as Token);
      authService.initState();

      expect(authService.decodeToken).toHaveBeenCalledWith('validToken');
      expect(authService.isAdmin.next).not.toHaveBeenCalled();
      expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(true);
    });

    it('should not set isAdmin or isAuthenticated$ if no token exists in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      spyOn(authService.isAdmin, 'next');
      spyOn(authService, 'decodeToken').and.returnValue({
        level: 'USER'
      } as Token);
      spyOn(authService.isAuthenticated$, 'next');
      spyOn(authService.isAuthenticated$, 'asObservable').and.returnValue(
        new BehaviorSubject<boolean>(false)
      );

      authService.initState();

      expect(authService.isAdmin.next).not.toHaveBeenCalled();
      expect(authService.isAuthenticated$.next).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should reset isAdmin, remove access token from localStorage, and set isAuthenticated$ to false', () => {
      spyOn(authService.isAdmin, 'next');
      spyOn(localStorage, 'removeItem');
      spyOn(authService.isAuthenticated$, 'next');

      authService.logout();

      expect(authService.isAdmin.next).toHaveBeenCalledWith(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return an observable of isAuthenticated$', () => {
      const isAuthenticated$ = new BehaviorSubject<boolean>(false);
      spyOn(authService, 'isUserAuthenticated').and.returnValue(true);
      spyOn(authService.isAuthenticated$, 'next').and.callThrough();
      spyOn(authService.isAuthenticated$, 'asObservable').and.returnValue(
        isAuthenticated$
      );

      const result = authService.isAuthenticated;

      expect(authService.isUserAuthenticated).toHaveBeenCalled();
      expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(true);
    });
  });

  describe('isUserAuthenticated', () => {
    it('should return true if a token exists and is valid', () => {
      const token = 'validToken';
      spyOn(localStorage, 'getItem').and.returnValue(token);
      spyOn(authService, 'isTokenValid').and.returnValue(true);

      const result = authService.isUserAuthenticated();

      expect(result).toBe(true);
    });

    it('should call logout and return false if no token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      spyOn(authService, 'logout');

      const result = authService.isUserAuthenticated();

      expect(authService.logout).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('isAdmin$', () => {
    it('should return the observable of isAdmin', () => {
      const isAdmin$ = new BehaviorSubject<boolean>(false);
      spyOn(authService.isAdmin, 'asObservable').and.returnValue(isAdmin$);

      const result = authService.isAdmin$();

      expect(authService.isAdmin.asObservable).toHaveBeenCalled();
      expect(result).toBe(isAdmin$);
    });
  });

  it('should login user and set access token', () => {
    const email = 'test@example.com';
    const password = 'password';
    spyOn(authService, 'decodeToken');
    const response: AuthResponse = {
      accessToken: 'token',
    };
    spyOn(localStorage, 'setItem');
    spyOn(httpClient, 'post').and.returnValue(of(response));
    spyOn(authService.isAdmin, 'next');
    spyOn(authService.isAuthenticated$, 'next');
    authService.login(email, password).subscribe();

    expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/login`, { email, password });
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', jasmine.any(String));
    expect(authService.isAdmin.next).not.toHaveBeenCalled();
    expect(authService.decodeToken).toHaveBeenCalledWith('token');
    expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(true);
  });

  it('should login admin user and set access token and isAdmin', () => {
    const email = 'admin@example.com';
    const password = 'password';
    const response: AuthResponse = {
      accessToken: 'token',
    };
    const decodedToken = {
      level: USER_ROLES.ADMIN,
    };

    spyOn(localStorage, 'setItem');
    spyOn(authService.isAdmin, 'next');
    spyOn(authService.isAuthenticated$, 'next');
    spyOn(authService, 'decodeToken').and.returnValue({
      level: 'ADMIN'
    } as Token);

    spyOn(httpClient, 'post').and.returnValue(of(response));

    authService.login(email, password).subscribe();

    expect(httpClient.post).toHaveBeenCalledWith(`${environment.api}/api/login`, { email, password });
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', response.accessToken);
    expect(authService.decodeToken).toHaveBeenCalledWith('token');
    expect(authService.isAuthenticated$.next).toHaveBeenCalledWith(true);
  });

});
