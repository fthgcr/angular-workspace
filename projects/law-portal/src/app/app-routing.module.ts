import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from 'shared-lib';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RedirectGuard } from './guards/redirect.guard';
import { ClientComponent } from './features/client/client.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  // Ana sayfa - Kullanıcı girişi yapıp yapmadığına göre yönlendir
  { path: '', canActivate: [RedirectGuard], children: [] },
  
  // Kimlik doğrulama sayfaları - Giriş yapmış kullanıcılar erişemez
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  
  // Profile - Tüm authenticated kullanıcılar erişebilir
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Client Component - Sadece USER rolü erişebilir
  { 
    path: 'client', 
    component: ClientComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { roles: ['USER'] } 
  },
  
  // Admin Dashboard - ADMIN ve LAWYER rolleri erişebilir
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule),
    canActivate: [AuthGuard, RoleGuard], 
    data: { roles: ['ADMIN', 'LAWYER'] } 
  },
  
  // User Dashboard - USER rolü için (Client component'ine redirect edecek)
  { 
    path: 'dashboard', 
    redirectTo: '/client', 
    pathMatch: 'full'
  },
  
  // Cases - Tüm kullanıcılar erişebilir (AuthGuard ile korunuyor)
  { 
    path: 'cases', 
    loadChildren: () => import('./features/cases/cases.module').then(m => m.CasesModule),
    canActivate: [AuthGuard] 
  },
  
  // Bilinmeyen route'lar için fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


