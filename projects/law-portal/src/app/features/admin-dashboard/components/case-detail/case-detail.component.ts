import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Case, CaseService, CaseType, CaseStatus } from '../../../../core/services/case.service';
import { Document, DocumentType, DocumentService, DocumentCreateRequest } from '../../../../core/services/document.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { LanguageService } from '../../../../services/language.service';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.scss']
})
export class CaseDetailComponent implements OnInit, OnDestroy {
  case: Case | null = null;
  documents: Document[] = [];
  loading = false;
  uploading = false;

  // Upload dialog
  showUploadDialog = false;
  uploadForm: FormGroup;
  selectedFiles: File[] = [];

  // Document type options
  documentTypeOptions: any[] = [];
  
  // Subscription
  private languageSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private caseService: CaseService,
    private documentService: DocumentService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      type: [DocumentType.OTHER, [Validators.required]]
    });
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  ngOnInit(): void {
    const caseId = this.route.snapshot.params['id'];
    this.loadCase(caseId);
    this.loadDocuments(caseId);
    this.updateDocumentTypeOptions();
    
    // Listen to language changes
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      this.updateDocumentTypeOptions();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  private updateDocumentTypeOptions(): void {
    this.documentTypeOptions = [
      { label: this.translate('document.type.complaint'), value: DocumentType.COMPLAINT },
      { label: this.translate('document.type.answer'), value: DocumentType.ANSWER },
      { label: this.translate('document.type.motion'), value: DocumentType.MOTION },
      { label: this.translate('document.type.exhibit'), value: DocumentType.EXHIBIT },
      { label: this.translate('document.type.contract'), value: DocumentType.CONTRACT },
      { label: this.translate('document.type.correspondence'), value: DocumentType.CORRESPONDENCE },
      { label: this.translate('document.type.other'), value: DocumentType.OTHER }
    ];
  }

  loadCase(caseId: number): void {
    this.loading = true;
    this.caseService.getCaseById(caseId)
      .pipe(
        catchError(error => {
          console.error('CaseDetailComponent: Error loading case:', error);
          console.error('CaseDetailComponent: Error status:', error.status);
          console.error('CaseDetailComponent: Error message:', error.message);
          this.messageService.add({
            severity: 'error',
            summary: this.translate('error'),
            detail: this.translate('error.loading.case')
          });
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(caseData => {
        this.case = caseData;
      });
  }

  loadDocuments(caseId: number): void {
    if (!caseId) return;
    
    this.loading = true;
    this.documentService.getDocumentsByCaseId(caseId)
      .pipe(
        catchError(error => {
          console.error('Error loading documents:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate('error'),
            detail: this.translate('error.loading.documents')
          });
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(documents => {
        this.documents = documents;
      });
  }

  goBack(): void {
    if (this.case?.client?.id) {
      // Navigate back to the client detail page
      this.router.navigate(['/admin/client', this.case.client.id]);
    } else {
      // Fallback to admin dashboard clients tab if no client info
      this.router.navigate(['/admin'], { queryParams: { tab: 'clients' } });
    }
  }

  openUploadDialog(): void {
    this.uploadForm.reset({
      type: DocumentType.OTHER
    });
    this.selectedFiles = [];
    this.showUploadDialog = true;
  }

  onFileSelect(event: any): void {
    this.selectedFiles = Array.from(event.files);
    
    // Auto-fill title with first file name if only one file
    if (this.selectedFiles.length === 1 && !this.uploadForm.get('title')?.value) {
      const fileName = this.selectedFiles[0].name;
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      this.uploadForm.patchValue({ title: nameWithoutExtension });
    }
  }

  uploadDocuments(): void {
    if (this.uploadForm.valid && this.selectedFiles.length > 0 && this.case?.id) {
      this.uploading = true;

      const uploadRequests = this.selectedFiles.map(file => {
        const request: DocumentCreateRequest = {
          legalCaseId: this.case!.id!,
          title: this.uploadForm.value.title,
          description: this.uploadForm.value.description,
          type: this.uploadForm.value.type
        };

        return this.documentService.uploadDocument(file, request);
      });

      // Upload files sequentially to avoid overwhelming the server
      this.uploadFilesSequentially(uploadRequests, 0);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate('warning'),
        detail: this.translate('warning.fill.required.fields')
      });
    }
  }

  private uploadFilesSequentially(uploadRequests: any[], index: number): void {
    if (index >= uploadRequests.length) {
      // All uploads completed
      this.uploading = false;
      this.showUploadDialog = false;
      this.uploadForm.reset();
      this.selectedFiles = [];
      this.loadDocuments(this.case!.id!); // Reload documents
      this.messageService.add({
        severity: 'success',
        summary: this.translate('success'),
        detail: this.translate('success.files.uploaded').replace('{count}', uploadRequests.length.toString())
      });
      return;
    }

    uploadRequests[index]
      .pipe(
        catchError((error: any) => {
          console.error('Error uploading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate('error'),
            detail: this.translate('error.uploading.file').replace('{filename}', this.selectedFiles[index]?.name || '')
          });
          return of(null);
        })
      )
      .subscribe((document: Document | null) => {
        if (document) {
          // Upload successful, continue with next file
          this.uploadFilesSequentially(uploadRequests, index + 1);
        } else {
          // Upload failed, but continue with remaining files
          this.uploadFilesSequentially(uploadRequests, index + 1);
        }
      });
  }

  downloadDocument(document: Document): void {
    if (!document.id) return;

    this.documentService.downloadDocument(document.id)
      .pipe(
        catchError(error => {
          console.error('Error downloading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate('error'),
            detail: this.translate('error.downloading.file')
          });
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = document.fileName;
          link.click();
          window.URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: this.translate('success'),
            detail: this.translate('success.file.downloaded')
          });
        }
      });
  }

  deleteDocument(document: Document): void {
    this.confirmationService.confirm({
      message: this.translate('confirm.delete.document').replace('{filename}', document.fileName),
      header: this.translate('delete.document'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate('yes'),
      rejectLabel: this.translate('no'),
      accept: () => {
        if (!document.id) return;

        this.documentService.deleteDocument(document.id)
          .pipe(
            catchError(error => {
              console.error('Error deleting document:', error);
              this.messageService.add({
                severity: 'error',
                summary: this.translate('error'),
                detail: this.translate('error.deleting.file')
              });
              return of(null);
            })
          )
          .subscribe(() => {
            this.documents = this.documents.filter(d => d.id !== document.id);
            this.messageService.add({
              severity: 'success',
              summary: this.translate('success'),
              detail: this.translate('success.file.deleted')
            });
          });
      }
    });
  }

  getDocumentTypeLabel(type: DocumentType): string {
    const option = this.documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getCaseTypeLabel(type: CaseType): string {
    switch (type) {
      case CaseType.CAR_DEPRECIATION: return this.translate('case.type.car.depreciation');
      case CaseType.CIVIL: return this.translate('case.type.civil');
      case CaseType.CRIMINAL: return this.translate('case.type.criminal');
      case CaseType.FAMILY: return this.translate('case.type.family');
      case CaseType.CORPORATE: return this.translate('case.type.corporate');
      case CaseType.REAL_ESTATE: return this.translate('case.type.real.estate');
      case CaseType.INTELLECTUAL_PROPERTY: return this.translate('case.type.intellectual.property');
      case CaseType.OTHER: return this.translate('case.type.other');
      default: return type as string;
    }
  }

  getStatusLabel(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return this.translate('status.open');
      case CaseStatus.IN_PROGRESS: return this.translate('status.in.progress');
      case CaseStatus.PENDING: return this.translate('status.pending');
      case CaseStatus.CLOSED: return this.translate('status.closed');
      default: return status as string;
    }
  }

  getStatusSeverity(status: CaseStatus): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case CaseStatus.OPEN: return 'info';
      case CaseStatus.IN_PROGRESS: return 'warning';
      case CaseStatus.PENDING: return 'secondary';
      case CaseStatus.CLOSED: return 'success';
      default: return 'secondary';
    }
  }

  getFileIcon(contentType: string): string {
    if (contentType?.includes('pdf')) return 'pi pi-file-pdf';
    if (contentType?.includes('word') || contentType?.includes('document')) return 'pi pi-file-word';
    if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) return 'pi pi-file-excel';
    if (contentType?.includes('image')) return 'pi pi-image';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  cancelUpload(): void {
    this.showUploadDialog = false;
    this.uploadForm.reset();
    this.selectedFiles = [];
  }

  getFieldError(fieldName: string): string {
    const field = this.uploadForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'title': return this.translate('error.title.required');
          case 'type': return this.translate('error.document.type.required');
          default: return this.translate('error.field.required').replace('{field}', fieldName);
        }
      }
    }
    return '';
  }

  getTruncatedText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getClientFullName(): string {
    if (!this.case?.client) return '';
    return `${this.case.client.firstName || ''} ${this.case.client.lastName || ''}`.trim();
  }

  getAssignedUserFullName(): string {
    if (!this.case?.assignedUser) return '';
    return `${this.case.assignedUser.firstName || ''} ${this.case.assignedUser.lastName || ''}`.trim();
  }
}