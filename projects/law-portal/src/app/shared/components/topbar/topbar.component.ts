import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AppConfigService } from 'shared-lib';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LanguageService, Language } from '../../../services/language.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentRole: string = '';
  currentUserProfile: any = null;
  menuItems: any[] = [];
  userMenuItems: any[] = [];

  // Language properties
  currentLanguage: Language;
  languages: Language[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private languageService: LanguageService,
    private appConfigService: AppConfigService,
    private themeService: ThemeService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.languages = this.languageService.languages;
  }

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

    this.authService.currentUserProfile$.subscribe(profile => {
      this.currentUserProfile = profile;
    });

    // Subscribe to language changes
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(language => {
        this.currentLanguage = language;
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
        label: this.translate('panel'),
        icon: 'pi pi-home',
        route: this.getDashboardRoute(),
        roles: ['USER', 'LAWYER', 'CLERK', 'ADMIN']
      }
      /*,
      { 
        label: 'Cases', 
        icon: 'pi pi-briefcase', 
        route: '/cases',
        roles: ['USER', 'LAWYER', 'CLERK', 'ADMIN']
      } */
    ];

    // Role özel menü öğeleri
    if (this.currentRole === 'ADMIN' || this.currentRole === 'LAWYER') {
      baseItems.push(
        {
          label: 'Hukuk Personeli',
          icon: 'pi pi-users',
          route: '/admin/lawyers',
          roles: ['ADMIN']
        }
        /*,
        { 
          label: 'Reports', 
          icon: 'pi pi-chart-bar', 
          route: '/admin/reports',
          roles: ['ADMIN', 'LAWYER', 'CLERK']
        } */
      );
    }

    // Kullanıcının rolüne göre menü öğelerini filtrele
    this.menuItems = baseItems.filter(item =>
      item.roles.includes(this.currentRole)
    );
  }

  private setUserMenuItems(): void {
    // Debug log
    this.userMenuItems = [
      /*{
        label: this.translate('profile'),
        icon: 'pi pi-user',
        command: () => {
          this.navigateTo('/profile');
        }
      }, 
      {
        separator: true
      },*/
      {
        label: this.translate('logout'),
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
    // Debug log
  }

  getDashboardRoute(): string {
    switch (this.currentRole) {
      case 'ADMIN':
        return '/admin';
      case 'LAWYER':
        return '/admin';
      case 'CLERK':
        return '/admin';
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
      summary: this.translate('logout.successful'),
      detail: `${this.translate('goodbye')} ${userName}! ${this.translate('logout.message')}`
    });

    // Login sayfasına yönlendir
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 300);
  }

  getUserDisplayName(): string {
    if (this.currentUserProfile && this.currentUserProfile.firstName && this.currentUserProfile.lastName) {
      return `${this.currentUserProfile.firstName} ${this.currentUserProfile.lastName}`;
    }
    return 'User';
  }

  onMenuToggle(event: Event, menu: any): void {
    // Debug log
    // Debug log
    menu.toggle(event);
  }

  getRoleDisplayName(): string {
    if (this.currentUser && this.currentUser.username) {
      return this.currentUser.username;
    }
    return 'User';
  }



  /**
   * Change language by code
   */
  changeLanguage(languageCode: string): void {
    const language = this.languages.find(lang => lang.code === languageCode);
    if (language && language.code !== this.currentLanguage.code) {
      this.languageService.setLanguage(language);
    }
  }

  /**
   * Get translation for a key
   */
  translate(key: string): string {
    return this.languageService.translate(key);
  }

  // App Config methods
  getAppTitle(): string {
    return this.languageService.translate('app.name');
  }

  getAppDescription(): string {
    return this.languageService.translate('app.description');
  }

  getLogoIcon(): string {
    return this.appConfigService.getLogoIcon();
  }

  getLogoImageUrl(): string {
    return this.appConfigService.getLogoImageUrl();
  }

  getEffectiveLogoUrl(): string {
    return this.appConfigService.getEffectiveLogoUrl();
  }

  hasLogoImage(): boolean {
    return this.appConfigService.hasLogoImage();
  }

  getLogoDimensions(): { width: number; height: number; recommended_size: string } {
    return this.appConfigService.getLogoDimensions();
  }

  // Theme methods
  getCurrentGradient(): string {
    return this.themeService.getCurrentGradient();
  }

  getAvailableGradients(): { [key: string]: string } {
    return this.themeService.getAvailableGradients();
  }

  changeGradient(gradientName: string): void {
    this.themeService.changeGradient(gradientName);
  }
} 