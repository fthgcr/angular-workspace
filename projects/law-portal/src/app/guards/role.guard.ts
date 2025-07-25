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
    const requiredRoles = route.data['roles'];
    const currentRole = this.authService.getCurrentRole();

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user has required role
    if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.includes(currentRole)) {
      return true;
    }

    // Access denied - redirect based on current role
    this.messageService.add({
      severity: 'warn',
      summary: 'Erişim Reddedildi',
      detail: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'
    });

    // Redirect to appropriate dashboard based on current role
    switch (currentRole) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'LAWYER':
        this.router.navigate(['/admin']);
        break;
      case 'CLERK':
        this.router.navigate(['/admin']); // Katip de admin paneline erişebilir
        break;
      case 'USER':
      case 'CLIENT':
        this.router.navigate(['/client']); // USER ve CLIENT sadece /client'e erişebilir
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }

    return false;
  }
} 