import { InjectionToken } from '@angular/core';

export interface NavigationConfig {
  adminDashboard: string;
  clientDashboard: string;
  userDashboard: string;
  defaultRoute?: string; // Fallback route
}

export const NAVIGATION_CONFIG = new InjectionToken<NavigationConfig>('NavigationConfig'); 