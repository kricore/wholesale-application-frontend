import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './shared/auth.service';

export interface Token {
  iat: number;
  exp: number;
  username: string;
  level?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    next?: ActivatedRouteSnapshot,
    state?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('access_token');
    if (!!token) {
      return this.authService.isTokenValid(token);
    }
    this.authService.logout();
    this.router.navigate(['/login']);

    return false;
  }

  /**
   * Make sure that the token has the appropriate format
   * and it is not expired
   * If not, navigate the user so he can login
   *
   * @param token
   * @returns
   */
  public isTokenValidWithRedirect(token: string): boolean {
    const isValid = this.authService.isTokenValid(token);
    if(!isValid){
      this.router.navigate(['/login']);
    }
    return isValid;
  }

}
