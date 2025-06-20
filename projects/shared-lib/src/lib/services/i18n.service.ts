import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'tr', name: 'Türkçe', flag: 'https://flagcdn.com/tr.svg' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/gb.svg' }
];

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('tr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [key: string]: { [key: string]: string } } = {
    tr: {
      // Login Page
      'login.welcome_back': 'Tekrar Hoş Geldiniz',
      'login.subtitle': 'Çalışma alanınıza erişmek için giriş yapın',
      'login.username_email': 'Kullanıcı Adı veya E-posta',
      'login.password': 'Şifre',
      'login.username_required': 'Kullanıcı adı gereklidir',
      'login.password_required': 'Şifre gereklidir',
      'login.remember_me': 'Beni hatırla',
      'login.forgot_password': 'Şifremi unuttum?',
      'login.sign_in': 'Giriş Yap',
      'login.or': 'veya',
      'login.no_account': 'Hesabınız yok mu?',
      'login.create_account': 'Hesap Oluştur',
      'login.already_logged_in': 'Zaten Giriş Yapılmış',
      'login.login_successful': 'Giriş Başarılı',
      'login.login_failed': 'Giriş Başarısız',
      'login.validation_error': 'Doğrulama Hatası',
      'login.fill_required_fields': 'Lütfen tüm gerekli alanları doldurun',
      'login.invalid_credentials': 'Geçersiz kullanıcı adı veya şifre',
      'login.account_inactive': 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.',
      'login.welcome_back_user': 'Tekrar hoş geldiniz',
      'login.logged_in_as': 'olarak giriş yapıldı',
      'login.redirecting': 'Yönlendiriliyor...',

      // Register Page
      'register.create_account': 'Hesap Oluştur',
      'register.subtitle': 'Bugün platformumuza katılın',
      'register.personal': 'Kişisel',
      'register.account': 'Hesap',
      'register.complete': 'Tamamla',
      'register.personal_info': 'Kişisel Bilgiler',
      'register.first_name': 'Ad',
      'register.last_name': 'Soyad',
      'register.email': 'E-posta Adresi',
      'register.phone': 'Telefon Numarası',
      'register.first_name_required': 'Ad gereklidir',
      'register.last_name_required': 'Soyad gereklidir',
      'register.email_required': 'E-posta gereklidir',
      'register.email_invalid': 'Geçerli bir e-posta girin',
      'register.phone_required': 'Telefon numarası gereklidir',
      'register.account_setup': 'Hesap Kurulumu',
      'register.username': 'Kullanıcı Adı',
      'register.password': 'Şifre',
      'register.confirm_password': 'Şifreyi Onayla',
      'register.username_required': 'Kullanıcı adı gereklidir',
      'register.password_required': 'Şifre gereklidir',
      'register.confirm_password_required': 'Lütfen şifrenizi onaylayın',
      'register.passwords_not_match': 'Şifreler eşleşmiyor',
      'register.terms_conditions': 'Şartlar ve Koşullar',
      'register.by_creating_account': 'Hesap oluşturarak şunları kabul etmiş olursunuz:',
      'register.terms_of_service': 'Hizmet Şartları',
      'register.privacy_policy': 'Gizlilik Politikası',
      'register.cookie_policy': 'Çerez Politikası',
      'register.accept_terms': 'Şartlar ve Koşulları kabul ediyorum',
      'register.subscribe_newsletter': 'Bültene abone ol (isteğe bağlı)',
      'register.accept_terms_required': 'Şartlar ve koşulları kabul etmelisiniz',
      'register.previous': 'Önceki',
      'register.next': 'Sonraki',
      'register.create_account_btn': 'Hesap Oluştur',
      'register.or': 'veya',
      'register.have_account': 'Zaten hesabınız var mı?',
      'register.sign_in': 'Giriş Yap',
      'register.already_logged_in': 'Zaten Giriş Yapılmış',
      'register.success': 'Başarılı',
      'register.success_message': 'Hesap başarıyla oluşturuldu! Lütfen doğrulama için e-postanızı kontrol edin.',
      'register.error': 'Hata',
      'register.registration_failed': 'Kayıt başarısız',

      // Common
      'common.language': 'Dil',
      'common.select_language': 'Dil Seçin',

      // Error Messages
      'error.generic': 'Beklenmeyen bir hata oluştu'
    },
    en: {
      // Login Page
      'login.welcome_back': 'Welcome Back',
      'login.subtitle': 'Sign in to access your workspace',
      'login.username_email': 'Username or Email',
      'login.password': 'Password',
      'login.username_required': 'Username is required',
      'login.password_required': 'Password is required',
      'login.remember_me': 'Remember me',
      'login.forgot_password': 'Forgot password?',
      'login.sign_in': 'Sign In',
      'login.or': 'or',
      'login.no_account': 'Don\'t have an account?',
      'login.create_account': 'Create Account',
      'login.already_logged_in': 'Already Logged In',
      'login.login_successful': 'Login Successful',
      'login.login_failed': 'Login Failed',
      'login.validation_error': 'Validation Error',
      'login.fill_required_fields': 'Please fill in all required fields',
      'login.invalid_credentials': 'Invalid username or password',
      'login.account_inactive': 'Your account is not active. Please contact administrator.',
      'login.welcome_back_user': 'Welcome back',
      'login.logged_in_as': 'Logged in as',
      'login.redirecting': 'Redirecting...',

      // Register Page
      'register.create_account': 'Create Account',
      'register.subtitle': 'Join our platform today',
      'register.personal': 'Personal',
      'register.account': 'Account',
      'register.complete': 'Complete',
      'register.personal_info': 'Personal Information',
      'register.first_name': 'First Name',
      'register.last_name': 'Last Name',
      'register.email': 'Email Address',
      'register.phone': 'Phone Number',
      'register.first_name_required': 'First name is required',
      'register.last_name_required': 'Last name is required',
      'register.email_required': 'Email is required',
      'register.email_invalid': 'Please enter a valid email',
      'register.phone_required': 'Phone number is required',
      'register.account_setup': 'Account Setup',
      'register.username': 'Username',
      'register.password': 'Password',
      'register.confirm_password': 'Confirm Password',
      'register.username_required': 'Username is required',
      'register.password_required': 'Password is required',
      'register.confirm_password_required': 'Please confirm your password',
      'register.passwords_not_match': 'Passwords do not match',
      'register.terms_conditions': 'Terms & Conditions',
      'register.by_creating_account': 'By creating an account, you agree to our:',
      'register.terms_of_service': 'Terms of Service',
      'register.privacy_policy': 'Privacy Policy',
      'register.cookie_policy': 'Cookie Policy',
      'register.accept_terms': 'I accept the Terms and Conditions',
      'register.subscribe_newsletter': 'Subscribe to newsletter (optional)',
      'register.accept_terms_required': 'You must accept the terms and conditions',
      'register.previous': 'Previous',
      'register.next': 'Next',
      'register.create_account_btn': 'Create Account',
      'register.or': 'or',
      'register.have_account': 'Already have an account?',
      'register.sign_in': 'Sign In',
      'register.already_logged_in': 'Already Logged In',
      'register.success': 'Success',
      'register.success_message': 'Account created successfully! Please check your email for verification.',
      'register.error': 'Error',
      'register.registration_failed': 'Registration failed',

      // Common
      'common.language': 'Language',
      'common.select_language': 'Select Language',

      // Error Messages
      'error.generic': 'An unexpected error occurred'
    }
  };

  constructor() {
    // Load saved language from localStorage or default to Turkish
    const savedLanguage = localStorage.getItem('language') || 'tr';
    this.setLanguage(savedLanguage);
  }

  setLanguage(languageCode: string): void {
    if (this.translations[languageCode]) {
      this.currentLanguageSubject.next(languageCode);
      localStorage.setItem('language', languageCode);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getLanguages(): Language[] {
    return LANGUAGES;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang]?.[key] || key;
  }

  // Helper method for component usage
  t(key: string): string {
    return this.translate(key);
  }
} 