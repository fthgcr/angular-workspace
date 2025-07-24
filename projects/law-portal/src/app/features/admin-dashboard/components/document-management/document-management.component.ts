import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DocumentService, Document, DocumentType } from '../../../../core/services/document.service';
import { CaseService } from '../../../../core/services/case.service';
import { Case } from '../case-management/case-management.component';
import { LanguageService } from '../../../../services/language.service';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class DocumentManagementComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  cases: Case[] = [];
  documentForm: FormGroup;
  showDialog = false;
  editingDocument: Document | null = null;
  loading = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  
  // Language subscription
  private languageSubscription: Subscription = new Subscription();
  
  documentTypeOptions = [
    { label: 'Şikayet/Dava Dilekçesi', value: DocumentType.COMPLAINT },
    { label: 'Cevap Dilekçesi', value: DocumentType.ANSWER },
    { label: 'Dilekçe/Talep', value: DocumentType.MOTION },
    { label: 'Delil/Belge', value: DocumentType.EXHIBIT },
    { label: 'Sözleşme', value: DocumentType.CONTRACT },
    { label: 'Yazışma', value: DocumentType.CORRESPONDENCE },
    { label: 'Diğer', value: DocumentType.OTHER }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private documentService: DocumentService,
    private caseService: CaseService,
    private languageService: LanguageService
  ) {
    this.documentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      type: [DocumentType.OTHER, [Validators.required]],
      legalCaseId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCases();
    this.updateDocumentTypeOptions();
    
    // Subscribe to language changes
    this.languageSubscription.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.updateDocumentTypeOptions();
      })
    );
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Dokümanlar yüklenirken bir hata oluştu'
        });
        this.loading = false;
      }
    });
  }

  loadCases(): void {
    this.caseService.getAllCases().subscribe({
      next: (cases) => {
        this.cases = cases.map(case_ => ({
          ...case_,
          fullName: `${case_.caseNumber} - ${case_.title}`
        }));
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Davalar yüklenirken bir hata oluştu'
        });
      }
    });
  }

  openNewDocumentDialog(): void {
    this.editingDocument = null;
    this.selectedFile = null;
    this.documentForm.reset({
      type: DocumentType.OTHER
    });
    this.showDialog = true;
  }

  editDocument(document: Document): void {
    this.editingDocument = document;
    this.selectedFile = null;
    this.documentForm.patchValue(document);
    this.showDialog = true;
  }

  deleteDocument(document: Document): void {
    this.confirmationService.confirm({
      message: `${document.title} dokümanını silmek istediğinizden emin misiniz?`,
      header: 'Doküman Sil',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        if (document.id) {
          this.documentService.deleteDocument(document.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Doküman başarıyla silindi'
              });
              this.loadDocuments();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Doküman silinirken bir hata oluştu'
              });
            }
          });
        }
      }
    });
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      this.documentForm.patchValue({
        title: file.name.split('.')[0]
      });
    }
  }

  onFileRemove(): void {
    this.selectedFile = null;
  }

  saveDocument(): void {
    if (this.documentForm.valid) {
      const formData = this.documentForm.value;
      
      if (!this.editingDocument && !this.selectedFile) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Uyarı',
          detail: 'Yeni doküman eklerken dosya seçimi zorunludur'
        });
        return;
      }

      if (this.editingDocument) {
        // Güncelleme - sadece metadata
        this.documentService.updateDocument(this.editingDocument.id!, {
          title: formData.title,
          description: formData.description,
          type: formData.type
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Doküman bilgileri güncellendi'
            });
            this.hideDialog();
            this.loadDocuments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Doküman güncellenirken bir hata oluştu'
            });
          }
        });
      } else {
        // Yeni ekleme - Base64 upload kullan
        this.uploadProgress = 0;
        this.documentService.uploadFileAsBase64(this.selectedFile!, formData).subscribe({
          next: () => {
            this.uploadProgress = 100;
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Yeni doküman veritabanına kaydedildi'
            });
            this.hideDialog();
            this.loadDocuments();
          },
          error: (error) => {
            this.uploadProgress = 0;
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Doküman yüklenirken bir hata oluştu: ' + (error.error?.message || error.message)
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

  hideDialog(): void {
    this.showDialog = false;
    this.documentForm.reset();
    this.editingDocument = null;
    this.selectedFile = null;
  }

  cancelDialog(): void {
    this.hideDialog();
  }

  downloadDocument(document: Document): void {
    if (document.id) {
      // Use base64 download method
      this.documentService.downloadDocumentAsFile(document.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${document.fileName} indirildi (Base64 Database Storage)`
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: 'Dosya indirilirken bir hata oluştu: ' + (error.error?.message || error.message)
          });
        }
      });
    }
  }

  searchDocuments(searchTerm: string): void {
    // Global search implementation - this will be handled by PrimeNG table's global filter
    // We can add custom logic here if needed
  }

  getCaseName(caseId: number): string {
    const caseItem = this.cases.find(c => c.id === caseId);
    return caseItem ? caseItem.title : 'Bilinmeyen Dava';
  }

  getCaseNumber(caseId: number): string {
    const caseItem = this.cases.find(c => c.id === caseId);
    return caseItem ? caseItem.caseNumber : 'N/A';
  }

  getTypeLabel(type: DocumentType): string {
    const option = this.documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getFileIcon(contentType: string): string {
    if (contentType.includes('pdf')) return 'pi pi-file-pdf';
    if (contentType.includes('word')) return 'pi pi-file-word';
    if (contentType.includes('excel')) return 'pi pi-file-excel';
    if (contentType.includes('image')) return 'pi pi-image';
    return 'pi pi-file';
  }

  getFileSizeText(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFieldError(fieldName: string): string {
    const field = this.documentForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} gereklidir`;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  translate(key: string): string {
    return this.languageService.translate(key);
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
} 