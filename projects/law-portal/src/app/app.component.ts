import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'shared-lib';
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
    private primeConfig: PrimeNGConfig,
    private languageService: LanguageService,
    private pageMetaService: PageMetaService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
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
