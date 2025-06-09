import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'shared-lib';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      // If user is not authenticated, redirect to login
      this.router.navigate(['/login']);
      return false;
    }

    // If user is authenticated, redirect based on role
    const currentRole = this.authService.getCurrentRole();
    
    switch (currentRole) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'LAWYER':
        this.router.navigate(['/lawyer']);
        break;
      case 'USER':
        this.router.navigate(['/client']);
        break;
      default:
        this.router.navigate(['/client']);
        break;
    }
    
    return false; // Always redirect, never allow access to root
  }
} 