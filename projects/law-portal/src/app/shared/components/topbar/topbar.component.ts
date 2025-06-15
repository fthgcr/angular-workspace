import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'shared-lib';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LanguageService, Language } from '../../../services/language.service';
import { AppConfigService } from '../../../services/app-config.service';

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
    private appConfigService: AppConfigService
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
        roles: ['USER', 'LAWYER', 'ADMIN']
      }
      /*,
      { 
        label: 'Cases', 
        icon: 'pi pi-briefcase', 
        route: '/cases',
        roles: ['USER', 'LAWYER', 'ADMIN']
      } */
    ];

    // Role özel menü öğeleri
    if (this.currentRole === 'ADMIN' || this.currentRole === 'LAWYER') {
      baseItems.push(
        { 
          label: this.translate('lawyers'), 
          icon: 'pi pi-users', 
          route: '/admin/lawyers',
          roles: ['ADMIN']
        }
        /*,
        { 
          label: 'Reports', 
          icon: 'pi pi-chart-bar', 
          route: '/admin/reports',
          roles: ['ADMIN', 'LAWYER']
        } */
      );
    }

    // Kullanıcının rolüne göre menü öğelerini filtrele
    this.menuItems = baseItems.filter(item => 
      item.roles.includes(this.currentRole)
    );
  }

  private setUserMenuItems(): void {
    console.log('Setting user menu items'); // Debug log
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
    console.log('User menu items set:', this.userMenuItems); // Debug log
  }

  getDashboardRoute(): string {
    switch (this.currentRole) {
      case 'ADMIN':
        return '/admin';
      case 'LAWYER':
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
    console.log('Menu toggle clicked', event); // Debug log
    console.log('Menu items:', this.userMenuItems); // Debug log
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
    return this.appConfigService.getAppTitle();
  }

  getAppDescription(): string {
    return this.appConfigService.getAppDescription();
  }

  getLogoIcon(): string {
    return this.appConfigService.getLogoIcon();
  }

  getLogoImageUrl(): string {
    return this.appConfigService.getLogoImageUrl();
  }

  getLogoBase64(): string {
    return this.appConfigService.getLogoBase64();
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
} 