import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'shared-lib';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentRole: string = '';
  menuItems: any[] = [];
  userMenuItems: any[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Subscribe to user and role changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.setMenuItems();
        this.setUserMenuItems();
      })
    );

    this.subscriptions.add(
      this.authService.currentRole$.subscribe(role => {
        this.currentRole = role || '';
        this.setMenuItems();
        this.setUserMenuItems();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setMenuItems(): void {
    // Rol bazlı menü öğelerini ayarla
    const baseItems = [
      { 
        label: 'Panel', 
        icon: 'pi pi-home', 
        route: this.getDashboardRoute(),
        roles: ['USER', 'LAWYER', 'ADMIN']
      },
      { 
        label: 'Cases', 
        icon: 'pi pi-briefcase', 
        route: '/cases',
        roles: ['USER', 'LAWYER', 'ADMIN']
      }
    ];

    // Role özel menü öğeleri
    if (this.currentRole === 'ADMIN') {
      baseItems.push(
        { 
          label: 'Users', 
          icon: 'pi pi-users', 
          route: '/admin/users',
          roles: ['ADMIN']
        },
        { 
          label: 'Reports', 
          icon: 'pi pi-chart-bar', 
          route: '/admin/reports',
          roles: ['ADMIN']
        }
      );
    } else if (this.currentRole === 'LAWYER') {
      baseItems.push(
        { 
          label: 'Clients', 
          icon: 'pi pi-users', 
          route: '/lawyer/clients',
          roles: ['LAWYER']
        },
        { 
          label: 'Calendar', 
          icon: 'pi pi-calendar', 
          route: '/lawyer/calendar',
          roles: ['LAWYER']
        }
      );
    }

    // Kullanıcının rolüne göre menü öğelerini filtrele
    this.menuItems = baseItems.filter(item => 
      item.roles.includes(this.currentRole)
    );
  }

  private setUserMenuItems(): void {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.navigateTo('/profile');
        }
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => {
          this.navigateTo('/settings');
        }
      }
    ];
  }

  getDashboardRoute(): string {
    switch (this.currentRole) {
      case 'ADMIN':
        return '/admin';
      case 'LAWYER':
        return '/lawyer';
      case 'USER':
      default:
        return '/client';
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    const userName = this.getUserDisplayName();
    
    // AuthService logout işlemi
    this.authService.logout();
    
    // Success mesajı göster
    this.messageService.add({
      severity: 'success',
      summary: 'Logout Successful',
      detail: `Goodbye ${userName}! You have been successfully logged out.`
    });
    
    // Login sayfasına yönlendir
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.firstName && this.currentUser.lastName 
        ? `${this.currentUser.firstName} ${this.currentUser.lastName}`
        : this.currentUser.username || 'User';
    }
    return 'User';
  }

  getRoleDisplayName(): string {
    switch (this.currentRole) {
      case 'ADMIN':
        return 'Administrator';
      case 'LAWYER':
        return 'Lawyer';
      case 'USER':
        return 'Client';
      default:
        return 'User';
    }
  }
} 