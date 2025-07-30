import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Client, ClientService } from '../../../../core/services/client.service';
import { Case, CaseStatus, CaseType, CaseService, CaseCreateRequest } from '../../../../core/services/case.service';
import { EventService } from '../../../../core/services/event.service';
import { LanguageService } from '../../../../services/language.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'shared-lib';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: Client | null = null;
  clientCases: Case[] = [];
  loading = false;
  savingCase = false;
  selectedCase: Case | null = null;
  clientId: any;

  // Form and Dialog
  caseForm: FormGroup;
  showCaseDialog = false;
  editingCase: Case | null = null;

  // Filter options
  caseStatusOptions: any[] = [];
  caseTypeOptions: any[] = [];

  // WhatsApp Dialog properties
  showWhatsappDialog = false;
  phoneNumberParameter: string = '';
  messageBodyObject: any = {};

  // Subscription
  private languageSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private clientService: ClientService,
    private caseService: CaseService,
    private eventService: EventService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
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

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentRole() === 'ADMIN';
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    this.loadClient(this.clientId);
    this.loadClientCases(this.clientId);
    this.updateOptions();

    // Listen to language changes
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      this.updateOptions();
      this.cdr.detectChanges(); // Force change detection to update dropdown options
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  private updateOptions(): void {
    // Create new arrays to ensure Angular detects the change
    this.caseStatusOptions = [
      { label: this.translate('status.open'), value: CaseStatus.OPEN },
      { label: this.translate('status.in.progress'), value: CaseStatus.IN_PROGRESS },
      { label: this.translate('status.pending'), value: CaseStatus.PENDING },
      { label: this.translate('status.closed'), value: CaseStatus.CLOSED }
    ];

    this.caseTypeOptions = [
      { label: this.translate('case.type.car.depreciation'), value: CaseType.CAR_DEPRECIATION },
      { label: this.translate('case.type.civil'), value: CaseType.CIVIL },
      { label: this.translate('case.type.criminal'), value: CaseType.CRIMINAL },
      { label: this.translate('case.type.family'), value: CaseType.FAMILY },
      { label: this.translate('case.type.corporate'), value: CaseType.CORPORATE },
      { label: this.translate('case.type.real.estate'), value: CaseType.REAL_ESTATE },
      { label: this.translate('case.type.intellectual.property'), value: CaseType.INTELLECTUAL_PROPERTY },
      { label: this.translate('case.type.other'), value: CaseType.OTHER }
    ];

    // Force change detection for dropdown updates
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
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
        try {
          // Her case için güvenli obje oluştur
          this.clientCases = cases
            .map(c => this.createSafeCaseFromResponse(c))
            .sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()); // Descending by filing date
          this.loading = false;

          // Change detection'ı zorla
          this.cdr.detectChanges();
        } catch (processingError) {
          console.error('Error processing cases response:', processingError);
          // Fallback: Basit mapping
          this.clientCases = cases
            .map(c => ({
              id: c.id,
              caseNumber: c.caseNumber,
              title: c.title,
              description: c.description,
              status: c.status,
              type: c.type,
              filingDate: new Date(c.filingDate),
              createdDate: c.createdDate ? new Date(c.createdDate) : undefined,
              updatedDate: c.updatedDate ? new Date(c.updatedDate) : undefined
            }))
            .sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());

          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate('error'),
          detail: this.translate('error.loading.cases') || 'Davalar yüklenirken bir hata oluştu'
        });
        this.loading = false;
        this.cdr.detectChanges();
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
      case CaseStatus.OPEN: return this.translate('status.open');
      case CaseStatus.IN_PROGRESS: return this.translate('status.in.progress');
      case CaseStatus.PENDING: return this.translate('status.pending');
      case CaseStatus.CLOSED: return this.translate('status.closed');
      default: return status;
    }
  }

  getTypeLabel(type: CaseType): string {
    switch (type) {
      case CaseType.CAR_DEPRECIATION: return this.translate('case.type.car.depreciation');
      case CaseType.CIVIL: return this.translate('case.type.civil');
      case CaseType.CRIMINAL: return this.translate('case.type.criminal');
      case CaseType.FAMILY: return this.translate('case.type.family');
      case CaseType.CORPORATE: return this.translate('case.type.corporate');
      case CaseType.REAL_ESTATE: return this.translate('case.type.real.estate');
      case CaseType.INTELLECTUAL_PROPERTY: return this.translate('case.type.intellectual.property');
      case CaseType.OTHER: return this.translate('case.type.other');
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
      message: this.translate('confirm.delete.case').replace('{caseNumber}', caseItem.caseNumber),
      header: this.translate('delete.case'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate('yes'),
      rejectLabel: this.translate('no'),
      accept: () => {
        if (caseItem.id) {
          this.caseService.deleteCase(caseItem.id).subscribe({
            next: () => {
              this.clientCases = this.clientCases.filter(c => c.id !== caseItem.id);
              this.messageService.add({
                severity: 'success',
                summary: this.translate('success'),
                detail: this.translate('case.deleted.successfully')
              });
            },
            error: (error) => {
              console.error('Error deleting case:', error);
              this.messageService.add({
                severity: 'error',
                summary: this.translate('error'),
                detail: error.error?.error || this.translate('error.deleting.case')
              });
            }
          });
        }
      }
    });
  }

  saveCase(): void {
    if (this.caseForm.valid && this.client?.id) {
      this.savingCase = true;
      // Sadece gerekli alanları açıkça belirterek CaseCreateRequest oluştur
      const currentUserProfile = this.authService.getCurrentUserProfile();
      const formData: CaseCreateRequest = {
        caseNumber: this.caseForm.value.caseNumber,
        title: this.caseForm.value.title,
        description: this.caseForm.value.description || '',
        status: this.caseForm.value.status,
        type: this.caseForm.value.type,
        filingDate: this.caseForm.value.filingDate.toISOString().split('T')[0], // Convert to ISO date string
        assignedUserId: currentUserProfile?.id,
        clientId: this.client.id
      };

      if (this.editingCase) {
        // Update existing case
        this.caseService.updateCase(this.editingCase.id!, formData).subscribe({
          next: (updatedCase) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate('success'),
              detail: this.translate('case.updated.successfully')
            });
            this.closeCaseDialog();
            // Liste yenilemeyi garanti etmek için loadClientCases çağır
            this.loadClientCases(this.clientId);
            // Dashboard'ı güncelle
            this.eventService.caseUpdated(updatedCase);
            this.savingCase = false;
          },
          error: (error) => {
            console.error('Error updating case:', error);

            // Lazy loading hata kontrolü - status 200 ise başarılı say
            if (error.status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate('success'),
                detail: this.translate('case.updated.successfully')
              });
              this.closeCaseDialog();
              this.loadClientCases(this.clientId);
              this.eventService.caseUpdated(formData);
            } else {
              // Gerçek hata durumu
              this.messageService.add({
                severity: 'error',
                summary: this.translate('error'),
                detail: error.error?.error || this.translate('error.updating.case')
              });
            }
            this.savingCase = false;
          }
        });
      } else {
        // Create new case
        this.caseService.createCase(formData).subscribe({
          next: (newCase) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate('success'),
              detail: this.translate('case.added.successfully')
            });
            this.closeCaseDialog();
            // Liste yenilemeyi garanti etmek için loadClientCases çağır
            this.loadClientCases(this.clientId);
            // Dashboard'ı güncelle
            this.eventService.caseCreated(newCase);
            this.savingCase = false;
            if (this.client && this.client.phoneNumber && this.client.phoneNumber.length >= 10) {
              this.phoneNumberParameter = this.client.phoneNumber;
              this.messageBodyObject = newCase;
              this.messageBodyObject["caseType"] = this.getTypeLabel(newCase.type);
              this.showWhatsappDialog = true;
            }
          },
          error: (error) => {
            console.error('Error creating case:', error);

            // Lazy loading hata kontrolü - status 200 ise başarılı say
            if (error.status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate('success'),
                detail: this.translate('case.added.successfully')
              });
              this.closeCaseDialog();
              this.loadClientCases(this.clientId);
              this.eventService.caseCreated(formData);
            } else {
              // Gerçek hata durumu
              this.messageService.add({
                severity: 'error',
                summary: this.translate('error'),
                detail: error.error?.error || this.translate('error.creating.case')
              });
            }
            this.savingCase = false;
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate('warning'),
        detail: this.translate('please.fill.required.fields')
      });
    }
  }

  private closeCaseDialog(): void {
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
        switch (fieldName) {
          case 'caseNumber': return this.translate('case.number.required');
          case 'title': return this.translate('case.title.required');
          case 'status': return this.translate('case.status.required');
          case 'type': return this.translate('case.type.required');
          case 'filingDate': return this.translate('filing.date.required');
          default: return this.translate('field.required').replace('{field}', fieldName);
        }
      }
    }
    return '';
  }

  getTruncatedTitle(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Backend response'ından güvenli Case objesi oluşturur
   * Lazy loading sorunlarını önlemek için sadece gerekli alanları kopyalar
   */
  private createSafeCaseFromResponse(caseData: any): Case {
    return {
      id: caseData.id,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      description: caseData.description,
      status: caseData.status,
      type: caseData.type,
      filingDate: new Date(caseData.filingDate),
      createdDate: caseData.createdDate ? new Date(caseData.createdDate) : undefined,
      updatedDate: caseData.updatedDate ? new Date(caseData.updatedDate) : undefined,
      // Client bilgilerini mevcut client'tan al veya güvenli şekilde kopyala
      client: this.client ? {
        id: this.client.id!,
        firstName: this.client.firstName,
        lastName: this.client.lastName,
        email: this.client.email,
        phoneNumber: this.client.phoneNumber,
        address: this.client.address
      } : (caseData.client ? {
        id: caseData.client.id,
        firstName: caseData.client.firstName || '',
        lastName: caseData.client.lastName || '',
        email: caseData.client.email || '',
        phoneNumber: caseData.client.phoneNumber,
        address: caseData.client.address
      } : undefined),
      // Assigned user bilgilerini güvenli şekilde kopyala
      assignedUser: caseData.assignedUser ? {
        id: caseData.assignedUser.id,
        firstName: caseData.assignedUser.firstName || '',
        lastName: caseData.assignedUser.lastName || '',
        email: caseData.assignedUser.email || ''
      } : undefined
    };
  }

  cancelCaseDialog(): void {
    this.closeCaseDialog();
  }
} 