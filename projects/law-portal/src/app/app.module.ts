import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedLibModule, NAVIGATION_CONFIG } from 'shared-lib';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClientComponent } from './features/client/client.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ProfileComponent } from './features/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    ClientComponent,
    TopbarComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedLibModule,
    ReactiveFormsModule,
    FormsModule,
    // PrimeNG Modules
    AccordionModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    MenuModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    {
      provide: NAVIGATION_CONFIG,
      useValue: {
        adminDashboard: '/admin-dashboard',
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
