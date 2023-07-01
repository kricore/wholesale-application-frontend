import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Token } from '../auth.guard';
import jwt_decode from 'jwt-decode';
import { environment } from 'src/environments/environment';

export interface AuthResponse {
  accessToken: string;
  token_type?: string;
  expires_in?: number;
  level?: string;
}

export enum USER_ROLES {
  ADMIN = "ADMIN",
  USER = "USER"
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);
  public isAdmin = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initState();
  }

  initState() {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded: Token = this.decodeToken(token);
      if (decoded?.level === USER_ROLES.ADMIN) {
        this.isAdmin.next(true);
      }
      this.isAuthenticated$.next(true);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.api}/api/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.accessToken);
          const decoded: Token = this.decodeToken(response.accessToken);
          if (decoded?.level === USER_ROLES.ADMIN) {
            this.isAdmin.next(true);
          }
          this.isAuthenticated$.next(true);
        })
      );
  }

  decodeToken(token: string): Token {
    return jwt_decode(token);
  }

  public logout(): void {
    this.isAdmin.next(false);
    localStorage.removeItem('access_token');
    this.isAuthenticated$.next(false);
  }

  public get User() {
    const token = localStorage.getItem('access_token')!;
    const decoded: Token = jwt_decode(token);
    const { username } = decoded;
    return username;
  }

  /**
   * Check for the token and it's expiration time
   */
  get isAuthenticated(): Observable<boolean> {
    const isUserValid = this.isUserAuthenticated();
    this.isAuthenticated$.next(isUserValid);
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Used internaly for redirects
   *
   * @returns
   */
  public isUserAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!!token) {
      return this.isTokenValid(token);
    }
    // clear any remaining data
    this.logout();
    return false;
  }

  /**
   * Used in the templates
   *
   * @returns
   */
  public isAdmin$() {
    return this.isAdmin.asObservable();
  }

  /**
   * Same check But with no redirects
   *
   * @param token
   * @returns
   */
  public isTokenValid(token: string): boolean {
    try {
      const decoded: Token = jwt_decode(token);
      const { exp } = decoded;
      const now = new Date().valueOf();
      const tokenValidity = exp * 1000 > now;
      if (!tokenValidity) {
        this.logout();
      }
      return tokenValidity;
    } catch (e) {
      // token was not of a proper format
      return false;
    }
  }
}
