import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Case, CaseService, CaseType, CaseStatus } from '../../../../core/services/case.service';
import { Document, DocumentType, DocumentService, DocumentCreateRequest } from '../../../../core/services/document.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.scss']
})
export class CaseDetailComponent implements OnInit {
  case: Case | null = null;
  documents: Document[] = [];
  loading = false;
  uploading = false;

  // Upload dialog
  showUploadDialog = false;
  uploadForm: FormGroup;
  selectedFiles: File[] = [];

  // Document type options
  documentTypeOptions = [
    { label: 'Dava Dilekçesi', value: DocumentType.COMPLAINT },
    { label: 'Cevap', value: DocumentType.ANSWER },
    { label: 'Dilekçe', value: DocumentType.MOTION },
    { label: 'Delil', value: DocumentType.EXHIBIT },
    { label: 'Sözleşme', value: DocumentType.CONTRACT },
    { label: 'Yazışma', value: DocumentType.CORRESPONDENCE },
    { label: 'Diğer', value: DocumentType.OTHER }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private caseService: CaseService,
    private documentService: DocumentService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      type: [DocumentType.OTHER, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const caseId = this.route.snapshot.params['id'];
    this.loadCase(caseId);
    this.loadDocuments(caseId);
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
            summary: 'Hata',
            detail: 'Dava bilgileri yüklenirken hata oluştu'
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
            summary: 'Hata',
            detail: 'Dokümanlar yüklenirken hata oluştu'
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
    this.router.navigate(['/admin'], { queryParams: { tab: 'clients' } });
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
        summary: 'Uyarı',
        detail: 'Lütfen gerekli alanları doldurun ve en az bir dosya seçin'
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
        summary: 'Başarılı',
        detail: `${uploadRequests.length} dosya başarıyla yüklendi`
      });
      return;
    }

    uploadRequests[index]
      .pipe(
        catchError((error: any) => {
          console.error('Error uploading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: `Dosya yüklenirken hata oluştu: ${this.selectedFiles[index]?.name}`
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
            summary: 'Hata',
            detail: 'Dosya indirilirken hata oluştu'
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
            summary: 'Başarılı',
            detail: 'Dosya başarıyla indirildi'
          });
        }
      });
  }

  deleteDocument(document: Document): void {
    this.confirmationService.confirm({
      message: `${document.fileName} dosyasını silmek istediğinizden emin misiniz?`,
      header: 'Dosya Sil',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        if (!document.id) return;

        this.documentService.deleteDocument(document.id)
          .pipe(
            catchError(error => {
              console.error('Error deleting document:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Dosya silinirken hata oluştu'
              });
              return of(null);
            })
          )
          .subscribe(() => {
            this.documents = this.documents.filter(d => d.id !== document.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Dosya başarıyla silindi'
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
      case CaseType.CAR_DEPRECIATION: return 'Değer Kaybı';
      case CaseType.CIVIL: return 'Hukuk';
      case CaseType.CRIMINAL: return 'Ceza';
      case CaseType.FAMILY: return 'Aile';
      case CaseType.CORPORATE: return 'Kurumsal';
      case CaseType.REAL_ESTATE: return 'Emlak';
      case CaseType.INTELLECTUAL_PROPERTY: return 'Fikri Mülkiyet';
      case CaseType.OTHER: return 'Diğer';
      default: return type as string;
    }
  }

  getStatusLabel(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'Açık';
      case CaseStatus.IN_PROGRESS: return 'Devam Ediyor';
      case CaseStatus.PENDING: return 'Beklemede';
      case CaseStatus.CLOSED: return 'Kapalı';
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
          case 'title': return 'Başlık gereklidir';
          case 'type': return 'Doküman türü gereklidir';
          default: return `${fieldName} gereklidir`;
        }
      }
    }
    return '';
  }
} 