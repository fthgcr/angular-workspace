import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'shared-lib';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRole = route.data['expectedRole'];
    const currentRole = this.authService.getCurrentRole();

    if (this.authService.isAuthenticated() && currentRole === expectedRole) {
      return true;
    }

    // If user has a different role, redirect to appropriate dashboard
    if (this.authService.isAuthenticated()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this page.'
      });

      // Redirect to appropriate dashboard based on current role
      switch (currentRole) {
        case 'ADMIN':
          this.router.navigate(['/admin-dashboard']);
          break;
        case 'LAWYER':
          this.router.navigate(['/lawyer-dashboard']);
          break;
        case 'CLIENT':
          this.router.navigate(['/client-dashboard']);
          break;
        case 'USER':
        default:
          this.router.navigate(['/dashboard']);
          break;
      }
    } else {
      // User is not authenticated, redirect to login
      this.router.navigate(['/login']);
    }

    return false;
  }
} 