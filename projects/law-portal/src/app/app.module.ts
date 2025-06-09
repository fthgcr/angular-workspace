import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedLibModule, NAVIGATION_CONFIG } from 'shared-lib';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClientComponent } from './features/client/client.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';

@NgModule({
  declarations: [
    AppComponent,
    ClientComponent,
    TopbarComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedLibModule,
    // PrimeNG Modules
    AccordionModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    MenuModule
  ],
  providers: [
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
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
