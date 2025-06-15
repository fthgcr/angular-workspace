import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppConfig {
  APP_TITLE: string;
  APP_DESC: string;
  PAGE_TITLE: string;
  FAVICON_URL: string;
  FAVICON_BASE64: string;
  LOGO_ICON: string;
  LOGO_IMAGE_URL: string;
  LOGO_BASE64: string;
  COMPANY_NAME: string;
  VERSION: string;
  COPYRIGHT: string;
  CONTACT_EMAIL: string;
  CONTACT_PHONE: string;
  SUPPORT_EMAIL: string;
  LOGO_DIMENSIONS: {
    width: number;
    height: number;
    recommended_size: string;
  };
  FAVICON_DIMENSIONS: {
    width: number;
    height: number;
    recommended_sizes: string;
  };
  THEME: {
    primary_color: string;
    secondary_color: string;
  };
  FOOTER: {
    show_footer: boolean;
    copyright_text: string;
    links: Array<{
      label: string;
      url: string;
      external: boolean;
    }>;
    show_version: boolean;
    show_powered_by: boolean;
    powered_by_text: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private defaultConfig: AppConfig = {
    APP_TITLE: 'LawPortal',
    APP_DESC: 'Legal Management System',
    PAGE_TITLE: 'LawPortal - Legal Management System',
    FAVICON_URL: '',
    FAVICON_BASE64: '',
    LOGO_ICON: 'pi pi-balance-scale',
    LOGO_IMAGE_URL: '',
    LOGO_BASE64: '',
    COMPANY_NAME: 'LawPortal',
    VERSION: '1.0.0',
    COPYRIGHT: '© 2024 LawPortal. All rights reserved.',
    CONTACT_EMAIL: 'info@lawportal.com',
    CONTACT_PHONE: '+90 (212) 123 45 67',
    SUPPORT_EMAIL: 'support@lawportal.com',
    LOGO_DIMENSIONS: {
      width: 40,
      height: 40,
      recommended_size: '40x40 pixels for optimal display'
    },
    FAVICON_DIMENSIONS: {
      width: 32,
      height: 32,
      recommended_sizes: '16x16, 32x32, 48x48 pixels for optimal browser support'
    },
    THEME: {
      primary_color: '#667eea',
      secondary_color: '#764ba2'
    },
    FOOTER: {
      show_footer: true,
      copyright_text: '© 2024 {COMPANY_NAME}. Tüm hakları saklıdır.',
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
      show_powered_by: false,
      powered_by_text: 'Powered by LawPortal'
    }
  };

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.http.get<AppConfig>('/assets/config/app-config.json').pipe(
      tap(config => {
        console.log('App config loaded:', config);
        this.configSubject.next(config);
      })
    ).subscribe({
      error: (error) => {
        console.error('Error loading app config, using defaults:', error);
        this.configSubject.next(this.defaultConfig);
      }
    });
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  getAppTitle(): string {
    return this.getConfig()?.APP_TITLE || this.defaultConfig.APP_TITLE;
  }

  getAppDescription(): string {
    return this.getConfig()?.APP_DESC || this.defaultConfig.APP_DESC;
  }

  getLogoIcon(): string {
    return this.getConfig()?.LOGO_ICON || this.defaultConfig.LOGO_ICON;
  }

  getLogoImageUrl(): string {
    return this.getConfig()?.LOGO_IMAGE_URL || this.defaultConfig.LOGO_IMAGE_URL;
  }

  getLogoBase64(): string {
    return this.getConfig()?.LOGO_BASE64 || this.defaultConfig.LOGO_BASE64;
  }

  getLogoDimensions(): { width: number; height: number; recommended_size: string } {
    return this.getConfig()?.LOGO_DIMENSIONS || this.defaultConfig.LOGO_DIMENSIONS;
  }

  hasLogoImage(): boolean {
    const logoUrl = this.getLogoImageUrl();
    const logoBase64 = this.getLogoBase64();
    return !!(logoUrl && logoUrl.trim() !== '') || !!(logoBase64 && logoBase64.trim() !== '');
  }

  getEffectiveLogoUrl(): string {
    const base64 = this.getLogoBase64();
    if (base64 && base64.trim() !== '') {
      // Base64 string'i data URL formatına çevir
      if (base64.startsWith('data:')) {
        return base64;
      } else {
        // Eğer data: prefix'i yoksa ekle (varsayılan olarak PNG)
        return `data:image/png;base64,${base64}`;
      }
    }
    return this.getLogoImageUrl();
  }

  getCompanyName(): string {
    return this.getConfig()?.COMPANY_NAME || this.defaultConfig.COMPANY_NAME;
  }

  getVersion(): string {
    return this.getConfig()?.VERSION || this.defaultConfig.VERSION;
  }

  getCopyright(): string {
    return this.getConfig()?.COPYRIGHT || this.defaultConfig.COPYRIGHT;
  }

  getContactEmail(): string {
    return this.getConfig()?.CONTACT_EMAIL || this.defaultConfig.CONTACT_EMAIL;
  }

  getContactPhone(): string {
    return this.getConfig()?.CONTACT_PHONE || this.defaultConfig.CONTACT_PHONE;
  }

  getSupportEmail(): string {
    return this.getConfig()?.SUPPORT_EMAIL || this.defaultConfig.SUPPORT_EMAIL;
  }

  getTheme(): { primary_color: string; secondary_color: string } {
    return this.getConfig()?.THEME || this.defaultConfig.THEME;
  }

  // Page Title and Favicon methods
  getPageTitle(): string {
    return this.getConfig()?.PAGE_TITLE || this.defaultConfig.PAGE_TITLE;
  }

  getFaviconUrl(): string {
    return this.getConfig()?.FAVICON_URL || this.defaultConfig.FAVICON_URL;
  }

  getFaviconBase64(): string {
    return this.getConfig()?.FAVICON_BASE64 || this.defaultConfig.FAVICON_BASE64;
  }

  getFaviconDimensions(): { width: number; height: number; recommended_sizes: string } {
    return this.getConfig()?.FAVICON_DIMENSIONS || this.defaultConfig.FAVICON_DIMENSIONS;
  }

  hasFavicon(): boolean {
    const faviconUrl = this.getFaviconUrl();
    const faviconBase64 = this.getFaviconBase64();
    return !!(faviconUrl && faviconUrl.trim() !== '') || !!(faviconBase64 && faviconBase64.trim() !== '');
  }

  getEffectiveFaviconUrl(): string {
    const base64 = this.getFaviconBase64();
    if (base64 && base64.trim() !== '') {
      // Base64 string'i data URL formatına çevir
      if (base64.startsWith('data:')) {
        return base64;
      } else {
        // Eğer data: prefix'i yoksa ekle (varsayılan olarak ICO)
        return `data:image/x-icon;base64,${base64}`;
      }
    }
    return this.getFaviconUrl();
  }

  // Footer methods
  getFooterConfig(): { show_footer: boolean; copyright_text: string; links: Array<{ label: string; url: string; external: boolean; }>; show_version: boolean; show_powered_by: boolean; powered_by_text: string; } {
    return this.getConfig()?.FOOTER || this.defaultConfig.FOOTER;
  }

  shouldShowFooter(): boolean {
    return this.getFooterConfig().show_footer;
  }

  getFooterCopyright(): string {
    const copyrightText = this.getFooterConfig().copyright_text;
    const companyName = this.getCompanyName();
    return copyrightText.replace('{COMPANY_NAME}', companyName);
  }

  getFooterLinks(): Array<{ label: string; url: string; external: boolean; }> {
    return this.getFooterConfig().links;
  }

  shouldShowVersion(): boolean {
    return this.getFooterConfig().show_version;
  }

  shouldShowPoweredBy(): boolean {
    return this.getFooterConfig().show_powered_by;
  }

  getPoweredByText(): string {
    return this.getFooterConfig().powered_by_text;
  }
} 