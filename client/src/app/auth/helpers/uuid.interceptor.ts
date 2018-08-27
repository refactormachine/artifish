import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../services/auth.service';

@Injectable()
export class UUIDInterceptor implements HttpInterceptor {
  constructor(public authService: AuthService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // if logged in don't send uuid
    if (this.authService.isLoggedIn() || !localStorage.getItem('uuid'))
      return next.handle(request);

    request = request.clone({
      setHeaders: {
        'Application-UUID': localStorage.getItem('uuid')
      }
    });
    return next.handle(request);
  }
}
