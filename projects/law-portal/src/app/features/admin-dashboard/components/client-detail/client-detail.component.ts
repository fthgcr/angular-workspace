import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Client, ClientService } from '../../../../core/services/client.service';
import { Case, CaseStatus, CaseType, CaseService, CaseCreateRequest } from '../../../../core/services/case.service';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  clientCases: Case[] = [];
  loading = false;
  selectedCase: Case | null = null;
  clientId: any;
  
  // Form and Dialog
  caseForm: FormGroup;
  showCaseDialog = false;
  editingCase: Case | null = null;
  
  // Filter options
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
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private clientService: ClientService,
    private caseService: CaseService
  ) {
    this.caseForm = this.fb.group({
      caseNumber: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      status: [CaseStatus.OPEN, [Validators.required]],
      type: [CaseType.CAR_DEPRECIATION, [Validators.required]],
      filingDate: [new Date(), [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    this.loadClient(this.clientId);
    this.loadClientCases(this.clientId);
  }

  loadClient(clientId: number): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Müvekkil bilgileri yüklenirken bir hata oluştu'
        });
        this.router.navigate(['/admin'], { queryParams: { tab: 'clients' } });
      }
    });
  }

  loadClientCases(clientId: number): void {
    this.loading = true;
    this.caseService.getCasesByClientId(clientId).subscribe({
      next: (cases) => {
        this.clientCases = cases
          .map(c => ({
            ...c,
            filingDate: new Date(c.filingDate)
          }))
          .sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()); // Descending by filing date
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

  goBack(): void {
    this.router.navigate(['/admin'], { queryParams: { tab: 'clients' } });
  }

  viewCaseDetails(caseItem: Case): void {
    this.router.navigate(['/admin/case', caseItem.id]);
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
    switch (status) {
      case CaseStatus.OPEN: return 'Açık';
      case CaseStatus.IN_PROGRESS: return 'Devam Ediyor';
      case CaseStatus.PENDING: return 'Beklemede';
      case CaseStatus.CLOSED: return 'Kapalı';
      default: return status;
    }
  }

  getTypeLabel(type: CaseType): string {
    switch (type) {
      case CaseType.CAR_DEPRECIATION: return 'Değer Kaybı';
      case CaseType.CIVIL: return 'Hukuk';
      case CaseType.CRIMINAL: return 'Ceza';
      case CaseType.FAMILY: return 'Aile';
      case CaseType.CORPORATE: return 'Kurumsal';
      case CaseType.REAL_ESTATE: return 'Emlak';
      case CaseType.INTELLECTUAL_PROPERTY: return 'Fikri Mülkiyet';
      case CaseType.OTHER: return 'Diğer';
      default: return type;
    }
  }

  // Case management methods
  openNewCaseDialog(): void {
    this.editingCase = null;
    this.caseForm.reset({
      status: CaseStatus.OPEN,
      type: CaseType.CAR_DEPRECIATION,
      filingDate: new Date()
    });
    this.generateCaseNumber();
    this.showCaseDialog = true;
  }

  editCase(caseItem: Case): void {
    this.editingCase = caseItem;
    this.caseForm.patchValue({
      ...caseItem,
      filingDate: new Date(caseItem.filingDate)
    });
    this.showCaseDialog = true;
  }

  deleteCase(caseItem: Case): void {
    this.confirmationService.confirm({
      message: `${caseItem.caseNumber} numaralı davayı silmek istediğinizden emin misiniz?`,
      header: 'Dava Sil',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        if (caseItem.id) {
          this.caseService.deleteCase(caseItem.id).subscribe({
            next: () => {
              this.clientCases = this.clientCases.filter(c => c.id !== caseItem.id);
              this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Dava başarıyla silindi'
              });
            },
            error: (error) => {
              console.error('Error deleting case:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: error.error?.error || 'Dava silinirken bir hata oluştu'
              });
            }
          });
        }
      }
    });
  }

  saveCase(): void {
    if (this.caseForm.valid && this.client?.id) {
      const formData: CaseCreateRequest = {
        ...this.caseForm.value,
        filingDate: this.caseForm.value.filingDate.toISOString().split('T')[0], // Convert to ISO date string
        assignedUserId: this.client.id,
        clientId: this.client.id
      };
      
      if (this.editingCase) {
        // Update existing case
        this.caseService.updateCase(this.editingCase.id!, formData).subscribe({
          next: (updatedCase) => {
            const index = this.clientCases.findIndex(c => c.id === this.editingCase!.id);
            if (index !== -1) {
              this.clientCases[index] = {
                ...updatedCase,
                filingDate: new Date(updatedCase.filingDate)
              };
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Dava bilgileri güncellendi'
            });
            this.showCaseDialog = false;
            this.caseForm.reset();
            this.editingCase = null;
            this.loadClientCases(this.clientId);
          },
          error: (error) => {
            console.error('Error updating case:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Dava güncellenirken bir hata oluştu'
            });
          }
        });
      } else {
        // Create new case
        this.caseService.createCase(formData).subscribe({
          next: (newCase) => {
            const caseWithDate = {
              ...newCase,
              filingDate: new Date(newCase.filingDate)
            };
            this.clientCases.unshift(caseWithDate); // Add to beginning for descending order
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Yeni dava eklendi'
            });
            this.showCaseDialog = false;
            this.caseForm.reset();
            this.editingCase = null;
            this.loadClientCases(this.clientId);
          },
          error: (error) => {
            console.error('Error creating case:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Dava oluşturulurken bir hata oluştu'
            });
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Lütfen gerekli alanları doldurun'
      });
    }
  }

  cancelCaseDialog(): void {
    this.showCaseDialog = false;
    this.caseForm.reset();
    this.editingCase = null;
  }

  generateCaseNumber(): void {
    this.caseService.generateCaseNumber().subscribe({
      next: (response) => {
        this.caseForm.patchValue({ caseNumber: response.caseNumber });
      },
      error: (error) => {
        console.error('Error generating case number:', error);
        // Fallback to local generation
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const caseNumber = `CASE-${year}-${randomNum}`;
        this.caseForm.patchValue({ caseNumber });
      }
    });
  }

  searchCases(searchTerm: string): void {
    // PrimeNG handles global search automatically
    // This method can be used for additional custom logic if needed
  }

  getFieldError(fieldName: string): string {
    const field = this.caseForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'caseNumber': return 'Dava numarası gereklidir';
          case 'title': return 'Dava başlığı gereklidir';
          case 'status': return 'Dava durumu gereklidir';
          case 'type': return 'Dava türü gereklidir';
          case 'filingDate': return 'Açılış tarihi gereklidir';
          default: return `${fieldName} gereklidir`;
        }
      }
    }
    return '';
  }
} 