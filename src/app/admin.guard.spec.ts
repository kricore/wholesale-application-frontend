import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGuard } from './admin.guard';
import { AuthService } from './shared/auth.service';
import { Observable, of } from 'rxjs';

class MockAuthService {
  isAdmin$(): Observable<boolean> {
    // Return a mock value indicating whether the user is an admin
    return of(true);
  }
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useClass: MockAuthService },
      ],
    });
    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService);
  });

  it('should allow access if user is an admin', () => {
    spyOn(authService, 'isAdmin$').and.returnValue(of(true));

    const routeSnapshot: any = {};
    const routerStateSnapshot: any = {};

    const result = guard.canActivate(routeSnapshot, routerStateSnapshot);
    (result as Observable<boolean>).subscribe((res: boolean) => {
      expect(res).toBe(true);
    });
  });

  it('should prevent access if user is not an admin',() => {
    spyOn(authService, 'isAdmin$').and.returnValue(of(false));

    const routeSnapshot: any = {};
    const routerStateSnapshot: any = {};

    const result = guard.canActivate(routeSnapshot, routerStateSnapshot);
    (result as Observable<boolean>).subscribe((res: boolean) => {
      expect(res).toBe(false);
    });
  });
});
