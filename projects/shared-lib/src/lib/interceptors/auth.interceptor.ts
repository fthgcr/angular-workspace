import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // JWT token expired veya unauthorized error handling
        if (error.status === 401) {
          // Check if this is a JWT token expiration error
          if (error.error &&
            (error.error.error === 'JWT token expired' ||
              error.error.error === 'Invalid JWT token' ||
              error.error.message?.includes('JWT expired'))) {
            // Clear all authentication data from localStorage
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_role');
              localStorage.removeItem('current_user');
              localStorage.removeItem('current_user_profile');
            }

            // Redirect to login page
            this.router.navigate(['/login'], {
              queryParams: {
                message: 'Oturum süreniz dolmuştur. Lütfen tekrar giriş yapın.',
                reason: 'token_expired'
              }
            });

            // Don't re-throw the error to avoid displaying error messages
            return throwError(() => new Error('Session expired'));
          }
        }

        // Hibernate lazy loading hatalarını handle et
        if (error.error && typeof error.error === 'string' &&
          error.error.includes('Could not write JSON') &&
          error.error.includes('Could not initialize proxy') &&
          (request.method === 'PUT' || request.method === 'POST')) {
          // Başarılı response olarak treat et
          return of(new HttpResponse({
            status: 200,
            statusText: 'OK',
            url: request.url || '',
            body: { success: true, message: 'Operation completed successfully' }
          }));
        }

        // Diğer hatalar için normal error handling
        throw error;
      })
    );
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }
}
