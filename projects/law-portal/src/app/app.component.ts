import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, AppConfigService } from 'shared-lib';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';
import { LanguageService } from './services/language.service';
import { PageMetaService } from './services/page-meta.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'law-portal';
  showTopbar = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private appConfigService: AppConfigService,
    private primeConfig: PrimeNGConfig,
    private languageService: LanguageService,
    private pageMetaService: PageMetaService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Law-portal için özel config ayarları
    this.appConfigService.setConfig({
      APP_TITLE: 'AS',
      APP_DESC: 'Hukuk & Danışmanlık',
      PAGE_TITLE: 'AS - Hukuk & Danışmanlık',
      LOGO_ICON: 'pi pi-balance-scale',
      COMPANY_NAME: 'AS',
      CONTACT_EMAIL: 'info@lawportal.com',
      CONTACT_PHONE: '+90 (212) 123 45 67',
      SUPPORT_EMAIL: 'support@lawportal.com',
      CAN_SIGN_UP: false,
      FORGOT_PASSWORD: false,
      THEME: {
        primary_color: '#113f67',
        secondary_color: '#385170',
        gradient: {
          direction: '135deg',
          start_color: '#113f67',
          end_color: '#385170',
          css_value: 'linear-gradient(135deg, #113f67 0%, #385170 100%)'
        }
      },
      FOOTER: {
        show_footer: true,
        copyright_text: '© {CURRENT_YEAR} {COMPANY_NAME}. Tüm hakları saklıdır.',
        links: [
          {
            label: 'Gizlilik Politikası',
            url: '/privacy-policy',
            external: false
          },
          {
            label: 'Kullanım Şartları',
            url: '/terms-of-service',
            external: false
          },
          {
            label: 'İletişim',
            url: '/contact',
            external: false
          }
        ],
        show_version: true,
        show_powered_by: false
      }
    });
    
    // PrimeNG config'i LanguageService'e kaydet
    this.languageService.setPrimeNGConfig(this.primeConfig);
    
    // Router events'i dinle ve topbar'ın görünürlüğünü kontrol et
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event) => {
          const navigationEnd = event as NavigationEnd;
          this.updateTopbarVisibility(navigationEnd.url);
        })
    );

    // Auth durumu değişikliklerini dinle
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(() => {
        this.updateTopbarVisibility(this.router.url);
      })
    );
    
    // İlk yüklemede de kontrol et
    this.updateTopbarVisibility(this.router.url);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateTopbarVisibility(url: string): void {
    // Login ve register sayfalarında topbar'ı gizle
    const hideTopbarRoutes = ['/login', '/register'];
    const shouldHideTopbar = hideTopbarRoutes.some(route => url.includes(route));
    
    // Kullanıcı giriş yapmış ve gizlenmesi gereken sayfalarda değilse topbar'ı göster
    this.showTopbar = this.authService.isAuthenticated() && !shouldHideTopbar;
  }
}
