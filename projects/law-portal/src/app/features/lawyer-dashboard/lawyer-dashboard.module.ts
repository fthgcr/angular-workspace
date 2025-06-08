import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LawyerDashboardComponent } from './lawyer-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: LawyerDashboardComponent
  }
];

@NgModule({
  declarations: [
    LawyerDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LawyerDashboardModule { } 