import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getToken();
    
    console.log('AuthInterceptor: Request URL:', request.url);
    console.log('AuthInterceptor: Token exists:', !!token);
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('AuthInterceptor: Added Authorization header');
    } else {
      console.log('AuthInterceptor: No token found, request without auth');
    }

    return next.handle(request);
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }
}
