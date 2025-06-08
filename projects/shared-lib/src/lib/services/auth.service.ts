import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, RegistrationRequest, RegistrationResponse, User } from '../models/auth.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.infraCoreUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.accessToken) {
            const storage = this.getStorage();
            if (storage) {
              storage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
              if (response.refreshToken) {
                storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
              }
              storage.setItem(this.USER_KEY, JSON.stringify(response.user));
            }
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(registrationData: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${environment.infraCoreUrl}/api/auth/register`, registrationData)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            // After successful registration, we don't automatically log in the user
            // They should go through the login process
            this.currentUserSubject.next(null);
          }
        })
      );
  }

  logout(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  getAccessToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.ACCESS_TOKEN_KEY) : null;
  }

  getRefreshToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.REFRESH_TOKEN_KEY) : null;
  }

  // For backward compatibility
  getToken(): string | null {
    return this.getAccessToken();
  }

  getCurrentUser(): User | null {
    const storage = this.getStorage();
    if (!storage) return null;
    const userStr = storage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
