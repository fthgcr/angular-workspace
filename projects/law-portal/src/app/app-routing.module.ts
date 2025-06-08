import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from 'shared-lib';
import { AuthGuard } from './guards/auth.guard';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthRedirectGuard]
  },
  // Admin Dashboard
  {
    path: 'admin-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' },
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule)
  },
  // Lawyer Dashboard
  {
    path: 'lawyer-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'LAWYER' },
    loadChildren: () => import('./features/lawyer-dashboard/lawyer-dashboard.module').then(m => m.LawyerDashboardModule)
  },
  // Client Dashboard
  {
    path: 'client-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'CLIENT' },
    loadChildren: () => import('./features/client-dashboard/client-dashboard.module').then(m => m.ClientDashboardModule)
  },
  // Default User Dashboard
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'USER' },
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  // Cases (accessible by all authenticated users)
  {
    path: 'cases',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/cases/cases.module').then(m => m.CasesModule)
  },
  // Default route - redirect based on role
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


