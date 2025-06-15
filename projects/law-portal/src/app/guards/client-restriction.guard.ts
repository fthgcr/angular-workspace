import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'shared-lib';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ClientRestrictionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUrl = state.url;

    // Always allow access to login and register pages (NoAuthGuard will handle authentication logic)
    if (currentUrl.startsWith('/login') || currentUrl.startsWith('/register')) {
      return true;
    }

    // Check if user is authenticated for other pages
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const currentRole = this.authService.getCurrentRole();

    // If user is CLIENT or USER, restrict to /client and /profile only
    if (currentRole === 'CLIENT' || currentRole === 'USER') {
      // Allow access to /client and its sub-routes
      if (currentUrl.startsWith('/client')) {
        return true;
      }

      // Allow access to /profile (users should be able to edit their profile)
      if (currentUrl.startsWith('/profile')) {
        return true;
      }

      // Deny access to all other routes and redirect to /client
      this.messageService.add({
        severity: 'warn',
        summary: 'Erişim Kısıtlaması',
        detail: 'Müvekkil kullanıcıları sadece müvekkil paneline erişebilir.'
      });

      this.router.navigate(['/client']);
      return false;
    }

    // For ADMIN and LAWYER roles, allow access to all routes
    return true;
  }
} 