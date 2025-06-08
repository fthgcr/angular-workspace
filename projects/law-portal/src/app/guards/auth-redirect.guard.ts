import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'shared-lib';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // If user is already authenticated, redirect to dashboard
      this.router.navigate(['/']);
      return false;
    }

    // If user is not authenticated, allow access to login/signup pages
    return true;
  }
} 