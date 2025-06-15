import { Injectable, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class PageMetaService {

  constructor(
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
    private appConfigService: AppConfigService
  ) {
    // Config yüklendikten sonra sayfa meta verilerini güncelle
    this.appConfigService.config$.subscribe(config => {
      if (config) {
        this.updatePageMeta();
      }
    });
  }

  updatePageMeta(): void {
    this.updateTitle();
    this.updateFavicon();
  }

  updateTitle(customTitle?: string): void {
    const title = customTitle || this.appConfigService.getPageTitle();
    this.titleService.setTitle(title);
  }

  updateFavicon(): void {
    if (this.appConfigService.hasFavicon()) {
      const faviconUrl = this.appConfigService.getEffectiveFaviconUrl();
      this.setFavicon(faviconUrl);
    }
  }

  private setFavicon(faviconUrl: string): void {
    // Mevcut favicon linklerini kaldır
    const existingFavicons = this.document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Yeni favicon ekle
    const link = this.document.createElement('link');
    link.rel = 'icon';
    link.type = this.getFaviconMimeType(faviconUrl);
    link.href = faviconUrl;
    
    // Farklı boyutlar için multiple favicon ekle
    const dimensions = this.appConfigService.getFaviconDimensions();
    link.setAttribute('sizes', `${dimensions.width}x${dimensions.height}`);
    
    this.document.head.appendChild(link);

    // Apple touch icon için de ekle
    const appleTouchIcon = this.document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = faviconUrl;
    appleTouchIcon.setAttribute('sizes', '180x180');
    this.document.head.appendChild(appleTouchIcon);
  }

  private getFaviconMimeType(faviconUrl: string): string {
    if (faviconUrl.includes('data:image/')) {
      // Data URL'den mime type'ı çıkar
      const match = faviconUrl.match(/data:([^;]+)/);
      return match ? match[1] : 'image/x-icon';
    }
    
    // Dosya uzantısından mime type belirle
    if (faviconUrl.endsWith('.png')) return 'image/png';
    if (faviconUrl.endsWith('.jpg') || faviconUrl.endsWith('.jpeg')) return 'image/jpeg';
    if (faviconUrl.endsWith('.svg')) return 'image/svg+xml';
    if (faviconUrl.endsWith('.gif')) return 'image/gif';
    
    return 'image/x-icon'; // Default ICO
  }

  // Sayfa başlığını özel durumlar için güncelle
  setPageTitle(title: string): void {
    this.updateTitle(title);
  }

  // Varsayılan başlığa geri dön
  resetPageTitle(): void {
    this.updateTitle();
  }

  // Favicon'u programatik olarak değiştir
  setCustomFavicon(faviconUrl: string): void {
    this.setFavicon(faviconUrl);
  }
} 