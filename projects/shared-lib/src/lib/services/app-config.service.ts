import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppConfig {
  APP_TITLE: string;
  APP_DESC: string;
  PAGE_TITLE: string;
  LOGO_ICON: string;
  LOGO_IMAGE_URL?: string;
  COMPANY_NAME: string;
  VERSION: string;
  COPYRIGHT: string;
  CONTACT_EMAIL: string;
  CONTACT_PHONE: string;
  SUPPORT_EMAIL: string;
  CAN_SIGN_UP?: boolean;
  FORGOT_PASSWORD?: boolean;
  THEME: {
    primary_color: string;
    secondary_color: string;
    gradient: {
      direction: string;
      start_color: string;
      end_color: string;
      css_value: string;
    };
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
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private defaultConfig: AppConfig = {
    APP_TITLE: 'LexOfis',
    APP_DESC: 'Legal Management System',
    PAGE_TITLE: 'LexOfis - Legal Management System',
    LOGO_ICON: 'pi pi-balance-scale',
    LOGO_IMAGE_URL: '',
    COMPANY_NAME: 'LexOfis',
    VERSION: '1.0.0',
    COPYRIGHT: '© {CURRENT_YEAR} {COMPANY_NAME}. All rights reserved.',
    CONTACT_EMAIL: 'info@lexofis.com',
    CONTACT_PHONE: '+90 (212) 123 45 67',
    SUPPORT_EMAIL: 'support@lexofis.com',
    CAN_SIGN_UP: true,
    FORGOT_PASSWORD: true,
    THEME: {
      primary_color: '#667eea',
      secondary_color: '#764ba2',
      gradient: {
        direction: '135deg',
        start_color: '#667eea',
        end_color: '#764ba2',
        css_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
    },
    FOOTER: {
      show_footer: true,
      copyright_text: '© {CURRENT_YEAR} {COMPANY_NAME}. All rights reserved.',
      links: [
        {
          label: 'Privacy Policy',
          url: '/privacy-policy',
          external: false
        },
        {
          label: 'Terms of Service',
          url: '/terms-of-service',
          external: false
        },
        {
          label: 'Contact',
          url: '/contact',
          external: false
        }
      ],
      show_version: true,
      show_powered_by: false
    }
  };

  // 🚨 CRITICAL FIELDS that MUST be changed for production
  private criticalFields = [
    'APP_TITLE',
    'APP_DESC', 
    'PAGE_TITLE',
    'COMPANY_NAME',
    'CONTACT_EMAIL',
    'CONTACT_PHONE',
    'SUPPORT_EMAIL'
  ];

  constructor(private http: HttpClient) {}

  // Load configuration from external URL or local config
  loadConfig(configUrl?: string): void {
    const url = configUrl || '/assets/config/app-config.json';
    
    this.http.get<AppConfig>(url).pipe(
      tap(config => {
        console.log('App config loaded:', config);
        this.configSubject.next(config);
        this.validateProductionConfig(config);
      })
    ).subscribe({
      error: (error) => {
        console.error('Error loading app config, using defaults:', error);
        this.configSubject.next(this.defaultConfig);
        this.validateProductionConfig(this.defaultConfig);
      }
    });
  }

  // Set configuration directly (useful for testing or runtime configuration)
  setConfig(config: Partial<AppConfig>): void {
    const currentConfig = this.getConfig() || this.defaultConfig;
    const mergedConfig = { ...currentConfig, ...config };
    this.configSubject.next(mergedConfig);
    this.validateProductionConfig(mergedConfig);
  }

  // 🚨 Validate critical production configuration
  private validateProductionConfig(config: AppConfig): void {
    const warnings: string[] = [];
    const criticalIssues: string[] = [];

    this.criticalFields.forEach(field => {
      const currentValue = config[field as keyof AppConfig];
      const defaultValue = this.defaultConfig[field as keyof AppConfig];
      
      if (currentValue === defaultValue) {
        if (field.includes('EMAIL') || field.includes('PHONE')) {
          criticalIssues.push(`🔴 CRITICAL: ${field} is using default value "${currentValue}" - This MUST be changed for production!`);
        } else {
          warnings.push(`🟡 WARNING: ${field} is using default value "${currentValue}" - Consider changing for production`);
        }
      }
    });

    // Check footer legal links
    const privacyLink = config.FOOTER.links.find(link => link.label === 'Privacy Policy');
    const termsLink = config.FOOTER.links.find(link => link.label === 'Terms of Service');
    
    if (privacyLink?.url === '/privacy-policy') {
      criticalIssues.push('🔴 CRITICAL: Privacy Policy URL is default - Must point to real privacy policy!');
    }
    
    if (termsLink?.url === '/terms-of-service') {
      criticalIssues.push('🔴 CRITICAL: Terms of Service URL is default - Must point to real terms!');
    }

    // Log warnings and critical issues
    if (criticalIssues.length > 0) {
      console.group('🚨 CRITICAL PRODUCTION CONFIG ISSUES');
      criticalIssues.forEach(issue => console.error(issue));
      console.groupEnd();
    }

    if (warnings.length > 0) {
      console.group('⚠️ PRODUCTION CONFIG WARNINGS');
      warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    if (criticalIssues.length === 0 && warnings.length === 0) {
      console.log('✅ Production config validation passed!');
    }
  }

  // Get validation status for monitoring
  getProductionReadiness(): { ready: boolean; criticalIssues: string[]; warnings: string[] } {
    const config = this.getConfig() || this.defaultConfig;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];

    this.criticalFields.forEach(field => {
      const currentValue = config[field as keyof AppConfig];
      const defaultValue = this.defaultConfig[field as keyof AppConfig];
      
      if (currentValue === defaultValue) {
        if (field.includes('EMAIL') || field.includes('PHONE')) {
          criticalIssues.push(field);
        } else {
          warnings.push(field);
        }
      }
    });

    return {
      ready: criticalIssues.length === 0,
      criticalIssues,
      warnings
    };
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  // Basic App Info
  getAppTitle(): string {
    return this.getConfig()?.APP_TITLE || this.defaultConfig.APP_TITLE;
  }

  getAppDescription(): string {
    return this.getConfig()?.APP_DESC || this.defaultConfig.APP_DESC;
  }

  getPageTitle(): string {
    return this.getConfig()?.PAGE_TITLE || this.defaultConfig.PAGE_TITLE;
  }

  // Logo
  getLogoIcon(): string {
    return this.getConfig()?.LOGO_ICON || this.defaultConfig.LOGO_ICON;
  }

  getLogoImageUrl(): string {
    return this.getConfig()?.LOGO_IMAGE_URL || this.defaultConfig.LOGO_IMAGE_URL || '';
  }

  hasLogoImage(): boolean {
    const logoUrl = this.getLogoImageUrl();
    return !!(logoUrl && logoUrl.trim() !== '');
  }

  getEffectiveLogoUrl(): string {
    return this.getLogoImageUrl();
  }

  getLogoDimensions(): { width: number; height: number; recommended_size: string } {
    return {
      width: 40,
      height: 40,
      recommended_size: '40x40 pixels for optimal display'
    };
  }

  // Company Info
  getCompanyName(): string {
    return this.getConfig()?.COMPANY_NAME || this.defaultConfig.COMPANY_NAME;
  }

  getVersion(): string {
    return this.getConfig()?.VERSION || this.defaultConfig.VERSION;
  }

  getCopyright(): string {
    const copyright = this.getConfig()?.COPYRIGHT || this.defaultConfig.COPYRIGHT;
    const currentYear = new Date().getFullYear();
    const companyName = this.getCompanyName();
    
    return copyright
      .replace('{CURRENT_YEAR}', currentYear.toString())
      .replace('{COMPANY_NAME}', companyName);
  }

  // Contact Info
  getContactEmail(): string {
    return this.getConfig()?.CONTACT_EMAIL || this.defaultConfig.CONTACT_EMAIL;
  }

  getContactPhone(): string {
    return this.getConfig()?.CONTACT_PHONE || this.defaultConfig.CONTACT_PHONE;
  }

  getSupportEmail(): string {
    return this.getConfig()?.SUPPORT_EMAIL || this.defaultConfig.SUPPORT_EMAIL;
  }

  // Sign Up Settings
  canSignUp(): boolean {
    const config = this.getConfig();
    return config?.CAN_SIGN_UP !== undefined ? config.CAN_SIGN_UP : this.defaultConfig.CAN_SIGN_UP!;
  }

  // Forgot Password Settings
  canUseForgotPassword(): boolean {
    const config = this.getConfig();
    return config?.FORGOT_PASSWORD !== undefined ? config.FORGOT_PASSWORD : this.defaultConfig.FORGOT_PASSWORD!;
  }

  // Theme
  getTheme() {
    return this.getConfig()?.THEME || this.defaultConfig.THEME;
  }

  getPrimaryColor(): string {
    return this.getTheme().primary_color;
  }

  getSecondaryColor(): string {
    return this.getTheme().secondary_color;
  }

  getPrimaryGradient(): string {
    return this.getTheme().gradient.css_value;
  }

  getGradientStartColor(): string {
    return this.getTheme().gradient.start_color;
  }

  getGradientEndColor(): string {
    return this.getTheme().gradient.end_color;
  }

  // Footer
  getFooterConfig() {
    return this.getConfig()?.FOOTER || this.defaultConfig.FOOTER;
  }

  shouldShowFooter(): boolean {
    return this.getFooterConfig().show_footer;
  }

  getFooterCopyright(): string {
    const copyrightText = this.getFooterConfig().copyright_text;
    const currentYear = new Date().getFullYear();
    const companyName = this.getCompanyName();
    
    return copyrightText
      .replace('{CURRENT_YEAR}', currentYear.toString())
      .replace('{COMPANY_NAME}', companyName);
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
} 