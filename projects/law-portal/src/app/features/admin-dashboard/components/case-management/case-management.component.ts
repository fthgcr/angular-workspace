import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Client } from '../client-management/client-management.component';

export interface Case {
  id?: number;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  type: CaseType;
  filingDate: Date;
  assignedUser?: Client;
  assignedUserId?: number;
  createdDate?: Date;
  updatedDate?: Date;
}

export enum CaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CaseType {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  CORPORATE = 'CORPORATE',
  REAL_ESTATE = 'REAL_ESTATE',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  OTHER = 'OTHER'
}

@Component({
  selector: 'app-case-management',
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.scss']
})
export class CaseManagementComponent implements OnInit {
  cases: Case[] = [];
  clients: Client[] = [];
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
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.caseForm = this.fb.group({
      caseNumber: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      status: [CaseStatus.OPEN, [Validators.required]],
      type: [CaseType.CIVIL, [Validators.required]],
      filingDate: [new Date(), [Validators.required]],
      assignedUserId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCases();
    this.loadClients();
  }

  loadCases(): void {
    this.loading = true;
    // TODO: API çağrısı yapılacak
    setTimeout(() => {
      this.cases = [
        {
          id: 1,
          caseNumber: 'CASE-2024-001',
          title: 'İş Mahkemesi Davası',
          description: 'İşçi-işveren uyuşmazlığı',
          status: CaseStatus.IN_PROGRESS,
          type: CaseType.CIVIL,
          filingDate: new Date('2024-01-15'),
          assignedUserId: 1,
          createdDate: new Date('2024-01-15')
        },
        {
          id: 2,
          caseNumber: 'CASE-2024-002',
          title: 'Boşanma Davası',
          description: 'Anlaşmalı boşanma süreci',
          status: CaseStatus.OPEN,
          type: CaseType.FAMILY,
          filingDate: new Date('2024-02-10'),
          assignedUserId: 2,
          createdDate: new Date('2024-02-10')
        }
      ];
      this.loading = false;
    }, 1000);
  }

  loadClients(): void {
    // TODO: API çağrısı yapılacak
    this.clients = [
      {
        id: 1,
        username: 'john.doe',
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        enabled: true
      },
      {
        id: 2,
        username: 'jane.smith',
        email: 'jane.smith@email.com',
        firstName: 'Jane',
        lastName: 'Smith',
        enabled: true
      }
    ];
  }

  openNewCaseDialog(): void {
    this.editingCase = null;
    this.caseForm.reset({
      status: CaseStatus.OPEN,
      type: CaseType.CIVIL,
      filingDate: new Date()
    });
    this.showDialog = true;
  }

  editCase(caseItem: Case): void {
    this.editingCase = caseItem;
    this.caseForm.patchValue({
      ...caseItem,
      filingDate: new Date(caseItem.filingDate)
    });
    this.showDialog = true;
  }

  deleteCase(caseItem: Case): void {
    this.confirmationService.confirm({
      message: `${caseItem.caseNumber} numaralı davayı silmek istediğinizden emin misiniz?`,
      header: 'Dava Sil',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.cases = this.cases.filter(c => c.id !== caseItem.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Dava başarıyla silindi'
        });
      }
    });
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
} 