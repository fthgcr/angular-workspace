import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from 'shared-lib';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RedirectGuard } from './guards/redirect.guard';
import { ClientRestrictionGuard } from './guards/client-restriction.guard';
import { ClientComponent } from './features/client/client.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  // Ana sayfa - Kullanıcı girişi yapıp yapmadığına göre yönlendir
  { path: '', canActivate: [RedirectGuard], children: [] },
  
  // Kimlik doğrulama sayfaları - CLIENT/USER kısıtlaması uygulanır
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard, ClientRestrictionGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard, ClientRestrictionGuard] },
  
  // Profile - Tüm authenticated kullanıcılar erişebilir, CLIENT/USER kısıtlaması uygulanır
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard, ClientRestrictionGuard] 
  },
  
  // Client Component - USER ve CLIENT rolleri erişebilir
  { 
    path: 'client', 
    component: ClientComponent, 
    canActivate: [AuthGuard, RoleGuard, ClientRestrictionGuard], 
    data: { roles: ['USER', 'CLIENT'] } 
  },
  
  // Admin Dashboard - ADMIN, LAWYER ve CLERK rolleri erişebilir, CLIENT/USER kısıtlaması uygulanır
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule),
    canActivate: [AuthGuard, RoleGuard, ClientRestrictionGuard], 
    data: { roles: ['ADMIN', 'LAWYER', 'CLERK'] } 
  },
  
  // User Dashboard - USER rolü için (Client component'ine redirect edecek)
  { 
    path: 'dashboard', 
    redirectTo: '/client', 
    pathMatch: 'full'
  },
  
  // Cases - Tüm kullanıcılar erişebilir, CLIENT/USER kısıtlaması uygulanır
  { 
    path: 'cases', 
    loadChildren: () => import('./features/cases/cases.module').then(m => m.CasesModule),
    canActivate: [AuthGuard, ClientRestrictionGuard] 
  },
  
  // Bilinmeyen route'lar için fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


