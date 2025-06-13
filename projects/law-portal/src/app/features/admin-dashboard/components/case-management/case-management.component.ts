import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CaseService, CaseStatus, CaseType } from '../../../../core/services/case.service';
import { ClientService } from '../../../../core/services/client.service';

export interface Case {
  id?: number;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  type: CaseType;
  filingDate: Date;
  createdDate?: Date;
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
  };
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  address?: string;
  enabled: boolean;
  createdDate?: Date;
  fullName?: string;
}

@Component({
  selector: 'app-case-management',
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CaseManagementComponent implements OnInit {
  cases: Case[] = [];
  clients: User[] = [];
  caseForm: FormGroup;
  showDialog = false;
  editingCase: Case | null = null;
  loading = false;
  
  caseStatusOptions = [
    { label: 'Açık', value: CaseStatus.OPEN },
    { label: 'Devam Ediyor', value: CaseStatus.IN_PROGRESS },
    { label: 'Beklemede', value: CaseStatus.PENDING },
    { label: 'Kapalı', value: CaseStatus.CLOSED }
  ];

  caseTypeOptions = [
    { label: 'Değer Kaybı', value: CaseType.CAR_DEPRECIATION },
    { label: 'Hukuk', value: CaseType.CIVIL },
    { label: 'Ceza', value: CaseType.CRIMINAL },
    { label: 'Aile', value: CaseType.FAMILY },
    { label: 'Kurumsal', value: CaseType.CORPORATE },
    { label: 'Emlak', value: CaseType.REAL_ESTATE },
    { label: 'Fikri Mülkiyet', value: CaseType.INTELLECTUAL_PROPERTY },
    { label: 'Diğer', value: CaseType.OTHER }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private caseService: CaseService,
    private clientService: ClientService
  ) {
    this.caseForm = this.fb.group({
      caseNumber: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      status: [CaseStatus.OPEN, [Validators.required]],
      type: [CaseType.CAR_DEPRECIATION, [Validators.required]],
      filingDate: [new Date(), [Validators.required]],
      assignedUserId: [null],
      clientId: [null, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadCases();
    this.loadClients();
  }

  loadCases() {
    this.loading = true;
    this.caseService.getAllCases().subscribe({
      next: (cases) => {
        this.cases = cases;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Davalar yüklenirken bir hata oluştu'
        });
        this.loading = false;
      }
    });
  }

  loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients.map(client => ({
          ...client,
          fullName: `${client.firstName} ${client.lastName}`
        }));
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Müvekkiller yüklenirken bir hata oluştu'
        });
      }
    });
  }

  openNewCaseDialog(): void {
    this.editingCase = null;
    this.caseForm.reset({
      status: CaseStatus.OPEN,
      type: CaseType.CAR_DEPRECIATION,
      filingDate: new Date()
    });
    this.showDialog = true;
  }

  saveCase(): void {
    if (this.caseForm.valid) {
      const formData = this.caseForm.value;
      
      if (this.editingCase) {
        // Güncelleme
        const index = this.cases.findIndex(c => c.id === this.editingCase!.id);
        if (index !== -1) {
          this.cases[index] = { 
            ...this.editingCase, 
            ...formData,
            updatedDate: new Date()
          };
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Dava bilgileri güncellendi'
        });
      } else {
        // Yeni ekleme
        const newCase: Case = {
          id: Math.max(...this.cases.map(c => c.id || 0)) + 1,
          ...formData,
          createdDate: new Date()
        };
        this.cases.push(newCase);
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Yeni dava eklendi'
        });
      }
      
      this.showDialog = false;
      this.caseForm.reset();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Lütfen gerekli alanları doldurun'
      });
    }
  }

  cancelDialog(): void {
    this.showDialog = false;
    this.caseForm.reset();
    this.editingCase = null;
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Atanmamış';
  }

  getStatusSeverity(status: CaseStatus): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case CaseStatus.OPEN: return 'info';
      case CaseStatus.IN_PROGRESS: return 'warning';
      case CaseStatus.PENDING: return 'secondary';
      case CaseStatus.CLOSED: return 'success';
      default: return 'info';
    }
  }

  getStatusLabel(status: CaseStatus): string {
    const option = this.caseStatusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getTypeLabel(type: CaseType): string {
    const option = this.caseTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getFieldError(fieldName: string): string {
    const field = this.caseForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} gereklidir`;
    }
    return '';
  }

  generateCaseNumber(): void {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const caseNumber = `CASE-${year}-${randomNum}`;
    this.caseForm.patchValue({ caseNumber });
  }

  hideDialog(): void {
    this.cancelDialog();
  }

  searchCases(searchTerm: string): void {
    // Global search implementation - this will be handled by PrimeNG table's global filter
    // We can add custom logic here if needed
  }

  viewCaseDetail(caseItem: Case): void {
    if (caseItem.id) {
      this.router.navigate(['/admin/case', caseItem.id]);
    }
  }
} 