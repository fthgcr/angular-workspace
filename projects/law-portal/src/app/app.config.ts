import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { NAVIGATION_CONFIG } from 'shared-lib';

import { routes } from './app-routing.module';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideAnimations(),
    MessageService,
    {
      provide: NAVIGATION_CONFIG,
      useValue: {
        adminDashboard: '/admin-dashboard',
        lawyerDashboard: '/lawyer-dashboard',
        clientDashboard: '/client-dashboard',
        userDashboard: '/client',
        defaultRoute: '/client'
      }
    }
  ]
};
