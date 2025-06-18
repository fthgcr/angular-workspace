import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

// Services and Interceptors
import { AuthService } from './services/auth.service';
import { I18nService } from './services/i18n.service';
import { AppConfigService } from './services/app-config.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LanguageSelectorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    CheckboxModule,
    DropdownModule
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    LanguageSelectorComponent,
    HttpClientModule
  ],
  providers: [
    MessageService,
    AuthService,
    I18nService,
    AppConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class SharedLibModule { }
