import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboardComponent } from './client-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ClientDashboardComponent
  }
];

@NgModule({
  declarations: [
    ClientDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ClientDashboardModule { } 