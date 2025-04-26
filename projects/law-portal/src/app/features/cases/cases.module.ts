import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CasesComponent } from './cases.component';

const routes: Routes = [
  {
    path: '',
    component: CasesComponent
  }
];

@NgModule({
  declarations: [
    CasesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CasesModule { }
