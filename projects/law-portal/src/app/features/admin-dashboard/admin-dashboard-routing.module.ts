import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { CaseDetailComponent } from './components/case-detail/case-detail.component';
import { AdminLawyersComponent } from './lawyers/admin-lawyers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'lawyers',
    component: AdminLawyersComponent
  },
  {
    path: 'client/:id',
    component: ClientDetailComponent
  },
  {
    path: 'case/:id',
    component: CaseDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule { } 