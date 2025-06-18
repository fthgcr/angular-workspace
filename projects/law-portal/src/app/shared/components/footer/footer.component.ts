import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../../../services/app-config.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(
    private appConfigService: AppConfigService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Config değişikliklerini dinle
    this.subscriptions.add(
      this.appConfigService.config$.subscribe(config => {
        if (config) {
          // Footer config güncellendiğinde gerekli işlemler
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Footer görünürlük kontrolü
  shouldShowFooter(): boolean {
    return this.appConfigService.shouldShowFooter();
  }

  // Copyright metni
  getCopyrightText(): string {
    return this.appConfigService.getFooterCopyright();
  }

  // Footer linkleri
  getFooterLinks(): Array<{ label: string; url: string; external: boolean; }> {
    return this.appConfigService.getFooterLinks();
  }

  // Versiyon gösterilsin mi?
  shouldShowVersion(): boolean {
    return this.appConfigService.shouldShowVersion();
  }

  // Versiyon numarası
  getVersion(): string {
    return this.appConfigService.getVersion();
  }

  // Powered by gösterilsin mi?
  shouldShowPoweredBy(): boolean {
    return this.appConfigService.shouldShowPoweredBy();
  }

  // Powered by metni
  getPoweredByText(): string {
    return this.appConfigService.getPoweredByText();
  }

  // Link tıklama işlemi
  onLinkClick(link: { label: string; url: string; external: boolean; }): void {
    if (link.external) {
      // Harici link - yeni sekmede aç
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      // İç link - router ile git
      this.router.navigate([link.url]);
    }
  }

  // Şirket adı
  getCompanyName(): string {
    return this.appConfigService.getCompanyName();
  }

  // İletişim bilgileri
  getContactEmail(): string {
    return this.appConfigService.getContactEmail();
  }

  getContactPhone(): string {
    return this.appConfigService.getContactPhone();
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