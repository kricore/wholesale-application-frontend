import { HttpInterceptor } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AuthHttpInterceptor } from './http.interceptor';

describe('HttpInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthHttpInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpInterceptor = TestBed.inject(AuthHttpInterceptor);
  });
});
