import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from 'shared-lib';
import { AuthGuard } from './guards/auth.guard';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';

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
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'cases',
        loadChildren: () => import('./features/cases/cases.module').then(m => m.CasesModule)
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


