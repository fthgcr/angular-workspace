import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private appConfigService: AppConfigService
  ) {
    // Config yüklendikten sonra tema değişkenlerini uygula
    this.appConfigService.config$.subscribe(config => {
      if (config) {
        this.applyThemeVariables();
      }
    });
  }

  applyThemeVariables(): void {
    const cssVariables = this.appConfigService.getGradientCSSVariables();
    const root = this.document.documentElement;

    // CSS custom properties'i root element'e uygula
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // Tema değiştirme metodları
  changeGradient(gradientName: string): void {
    const gradient = this.appConfigService.getAlternativeGradient(gradientName);
    this.document.documentElement.style.setProperty('--primary-gradient', gradient);
  }

  resetToDefaultGradient(): void {
    const defaultGradient = this.appConfigService.getPrimaryGradient();
    this.document.documentElement.style.setProperty('--primary-gradient', defaultGradient);
  }

  // Mevcut tema bilgilerini al
  getCurrentGradient(): string {
    return this.appConfigService.getPrimaryGradient();
  }

  getAvailableGradients(): { [key: string]: string } {
    return this.appConfigService.getAlternativeGradients();
  }

  // CSS değişkenlerini manuel olarak güncelle
  updateCSSVariable(property: string, value: string): void {
    this.document.documentElement.style.setProperty(property, value);
  }

  // Tüm tema değişkenlerini sıfırla
  resetAllThemeVariables(): void {
    const cssVariables = this.appConfigService.getGradientCSSVariables();
    const root = this.document.documentElement;

    Object.keys(cssVariables).forEach(property => {
      root.style.removeProperty(property);
    });

    // Sonra tekrar uygula
    this.applyThemeVariables();
  }
} 