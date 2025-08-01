import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';

// PrimeNG Modules
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';

// Components
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ClientManagementComponent } from './components/client-management/client-management.component';
import { CaseManagementComponent } from './components/case-management/case-management.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { CaseDetailComponent } from './components/case-detail/case-detail.component';
import { AdminLawyersComponent } from './lawyers/admin-lawyers.component';
import { WhatsappDialogComponent } from '../../shared/components/whatsapp-dialog/whatsapp-dialog.component';

// Services
import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    ClientManagementComponent,
    CaseManagementComponent,
    DocumentManagementComponent,
    ClientDetailComponent,
    CaseDetailComponent,
    AdminLawyersComponent,
    WhatsappDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminDashboardRoutingModule,
    
    // PrimeNG Modules
    TabMenuModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    FileUploadModule,
    ProgressBarModule,
    CardModule,
    InputNumberModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ]
})
export class AdminDashboardModule { } 