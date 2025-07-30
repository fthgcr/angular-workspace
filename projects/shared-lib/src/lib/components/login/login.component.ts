import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { AppConfigService } from '../../services/app-config.service';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private appConfigService: AppConfigService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check for session expiration message from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'token_expired' && params['message']) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Oturum Süresi Doldu',
          detail: params['message'],
          life: 8000
        });
      }
    });

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      const userProfile = this.authService.getCurrentUserProfile();
      const currentUser = this.authService.getCurrentUser();

      let displayName = 'User';
      if (userProfile?.firstName && userProfile?.lastName) {
        displayName = `${userProfile.firstName} ${userProfile.lastName}`;
      } else if (currentUser?.username) {
        displayName = currentUser.username;
      }

      this.messageService.add({
        severity: 'info',
        summary: this.t('login.already_logged_in'),
        detail: `${this.t('login.already_logged_in')} ${displayName}. ${this.t('login.redirecting')}`
      });

      setTimeout(() => {
        this.redirectBasedOnRole();
      }, 2000);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  private redirectBasedOnRole(): void {
    // Tüm kullanıcıları ana sayfaya yönlendir
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          // AuthService otomatik olarak user profile'ı yükleyecek
          // Kısa bir gecikme ile profile'ın yüklenmesini bekleyelim
          setTimeout(() => {
            const userProfile = this.authService.getCurrentUserProfile();
            let displayName = 'User';

            if (userProfile?.firstName && userProfile?.lastName) {
              displayName = `${userProfile.firstName} ${userProfile.lastName}`;
            } else {
              // Fallback olarak username kullan
              const username = this.authService.getCurrentUser()?.username;
              if (username) {
                displayName = username;
              }
            }

            this.messageService.add({
              severity: 'success',
              summary: this.t('login.login_successful'),
              detail: `${this.t('login.welcome_back_user')}, ${displayName}! ${this.t('login.redirecting')}`
            });

            // Navigate based on role after a short delay
            setTimeout(() => {
              this.redirectBasedOnRole();
            }, 1500);
          }, 100); // User profile yüklenmesi için kısa gecikme
        },
        error: (error) => {
          let errorMessage = this.t('login.invalid_credentials');

          // Check if error response has messageKey for translation
          if (error.error?.messageKey) {
            errorMessage = this.t(error.error.messageKey);
          } else if (error.error?.message) {
            // Use the message from backend if no messageKey
            errorMessage = error.error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: this.t('login.login_failed'),
            detail: errorMessage
          });
          this.loading = false;
        },
        complete: () => {
          // Don't set loading to false here since we're navigating
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.t('login.validation_error'),
        detail: this.t('login.fill_required_fields')
      });
    }
  }

  // Helper methods for template
  t(key: string): string {
    return this.i18nService.translate(key);
  }

  getAppTitle(): string {
    return this.appConfigService.getPageTitle();
  }

  canSignUp(): boolean {
    return this.appConfigService.canSignUp();
  }

  canUseForgotPassword(): boolean {
    return this.appConfigService.canUseForgotPassword();
  }
}
