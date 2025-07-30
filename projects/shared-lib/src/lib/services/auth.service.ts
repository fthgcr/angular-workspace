import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, RegistrationRequest, RegistrationResponse, User } from '../models/auth.model';
import { UserProfile } from './user-profile.service';
import { environment } from '../environments/environment';

interface JwtAuthenticationResponse {
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly USER_ROLE_KEY = 'user_role';
  private readonly USER_KEY = 'current_user';
  private readonly USER_PROFILE_KEY = 'current_user_profile';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private currentRoleSubject: BehaviorSubject<string | null>;
  public currentRole$: Observable<string | null>;
  private currentUserProfileSubject: BehaviorSubject<UserProfile | null>;
  public currentUserProfile$: Observable<UserProfile | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentRoleSubject = new BehaviorSubject<string | null>(this.getCurrentRole());
    this.currentRole$ = this.currentRoleSubject.asObservable();
    this.currentUserProfileSubject = new BehaviorSubject<UserProfile | null>(this.getCurrentUserProfile());
    this.currentUserProfile$ = this.currentUserProfileSubject.asObservable();

    // Schedule profile loading after component initialization to avoid circular dependency
    if (this.isAuthenticated()) {
      setTimeout(() => this.loadUserProfileOnInit(), 0);
    }
  }

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  login(credentials: LoginRequest): Observable<JwtAuthenticationResponse> {
    // Use aslaw login endpoint for law-specific role handling
    const url = `${environment.aslawUrl}/law/auth/login`;
    return this.http.post<JwtAuthenticationResponse>(url, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            const storage = this.getStorage();
            if (storage) {
              storage.setItem(this.ACCESS_TOKEN_KEY, response.token);
              storage.setItem(this.USER_ROLE_KEY, response.role);
            }
            this.currentRoleSubject.next(response.role);
            // For backward compatibility, create a user object with role
            const user: User = {
              username: this.getUsernameFromToken(response.token),
              role: response.role
            };
            if (storage) {
              storage.setItem(this.USER_KEY, JSON.stringify(user));
            }
            this.currentUserSubject.next(user);

            // Load full user profile after successful login
            this.loadUserProfile();
          }
        })
      );
  }

  register(registrationData: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${environment.infraCoreUrl}/auth/register`, registrationData)
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
      storage.removeItem(this.USER_ROLE_KEY);
      storage.removeItem(this.USER_KEY);
      storage.removeItem(this.USER_PROFILE_KEY);
    }
    this.currentUserSubject.next(null);
    this.currentRoleSubject.next(null);
    this.currentUserProfileSubject.next(null);
  }

  getAccessToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.ACCESS_TOKEN_KEY) : null;
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

  getCurrentRole(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.USER_ROLE_KEY) : null;
  }

  getCurrentUserProfile(): UserProfile | null {
    const storage = this.getStorage();
    if (!storage) return null;
    const profileStr = storage.getItem(this.USER_PROFILE_KEY);
    return profileStr ? JSON.parse(profileStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getCurrentRole() === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isUser(): boolean {
    return this.hasRole('USER');
  }

  private getUsernameFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch (error) {
      return '';
    }
  }

  private loadUserProfileOnInit(): void {
    if (this.isAuthenticated()) {
      // Just refresh from API to get latest data
      this.loadUserProfile();
    }
  }

  private loadUserProfile(): void {
    const url = `${environment.infraCoreUrl}/user/profile`;
    this.http.get<UserProfile>(url).subscribe({
      next: (profile) => {
        const storage = this.getStorage();
        if (storage) {
          storage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile));
        }
        this.currentUserProfileSubject.next(profile);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.currentUserProfileSubject.next(null);
      }
    });
  }

  /**
   * Refresh user profile data from API
   */
  refreshUserProfile(): void {
    if (this.isAuthenticated()) {
      this.loadUserProfile();
    }
  }
}
