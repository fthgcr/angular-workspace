import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Case } from '../case-management/case-management.component';

export interface Document {
  id?: number;
  title: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  legalCaseId?: number;
  legalCase?: Case;
  type: DocumentType;
  createdDate?: Date;
  updatedDate?: Date;
}

export enum DocumentType {
  COMPLAINT = 'COMPLAINT',
  ANSWER = 'ANSWER',
  MOTION = 'MOTION',
  EXHIBIT = 'EXHIBIT',
  CONTRACT = 'CONTRACT',
  CORRESPONDENCE = 'CORRESPONDENCE',
  OTHER = 'OTHER'
}

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss']
})
export class DocumentManagementComponent implements OnInit {
  documents: Document[] = [];
  cases: Case[] = [];
  documentForm: FormGroup;
  showDialog = false;
  editingDocument: Document | null = null;
  loading = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  
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
    private confirmationService: ConfirmationService
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
  }

  loadDocuments(): void {
    this.loading = true;
    // TODO: API çağrısı yapılacak
    setTimeout(() => {
      this.documents = [
        {
          id: 1,
          title: 'İş Mahkemesi Dava Dilekçesi',
          fileName: 'dava_dilekçesi.pdf',
          contentType: 'application/pdf',
          fileSize: 245760,
          description: 'İşçi-işveren uyuşmazlığı için açılan dava dilekçesi',
          type: DocumentType.COMPLAINT,
          legalCaseId: 1,
          createdDate: new Date('2024-01-15')
        },
        {
          id: 2,
          title: 'İş Sözleşmesi',
          fileName: 'is_sozlesmesi.pdf',
          contentType: 'application/pdf',
          fileSize: 186420,
          description: 'Taraflar arasındaki iş sözleşmesi',
          type: DocumentType.CONTRACT,
          legalCaseId: 1,
          createdDate: new Date('2024-01-20')
        },
        {
          id: 3,
          title: 'Boşanma Dilekçesi',
          fileName: 'bosanma_dilekçesi.pdf',
          contentType: 'application/pdf',
          fileSize: 324680,
          description: 'Anlaşmalı boşanma süreci dilekçesi',
          type: DocumentType.COMPLAINT,
          legalCaseId: 2,
          createdDate: new Date('2024-02-10')
        }
      ];
      this.loading = false;
    }, 1000);
  }

  loadCases(): void {
    // TODO: API çağrısı yapılacak
    this.cases = [
      {
        id: 1,
        caseNumber: 'CASE-2024-001',
        title: 'İş Mahkemesi Davası',
        description: 'İşçi-işveren uyuşmazlığı',
        status: 'IN_PROGRESS' as any,
        type: 'CIVIL' as any,
        filingDate: new Date('2024-01-15')
      },
      {
        id: 2,
        caseNumber: 'CASE-2024-002',
        title: 'Boşanma Davası',
        description: 'Anlaşmalı boşanma süreci',
        status: 'OPEN' as any,
        type: 'FAMILY' as any,
        filingDate: new Date('2024-02-10')
      }
    ];
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
        this.documents = this.documents.filter(d => d.id !== document.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Doküman başarıyla silindi'
        });
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
        // Güncelleme
        const index = this.documents.findIndex(d => d.id === this.editingDocument!.id);
        if (index !== -1) {
          this.documents[index] = { 
            ...this.editingDocument, 
            ...formData,
            updatedDate: new Date()
          };
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Doküman bilgileri güncellendi'
        });
      } else {
        // Yeni ekleme
        const newDocument: Document = {
          id: Math.max(...this.documents.map(d => d.id || 0)) + 1,
          ...formData,
          fileName: this.selectedFile!.name,
          contentType: this.selectedFile!.type,
          fileSize: this.selectedFile!.size,
          createdDate: new Date()
        };
        this.documents.push(newDocument);
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Yeni doküman eklendi'
        });
      }
      
      this.showDialog = false;
      this.documentForm.reset();
      this.selectedFile = null;
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
    this.documentForm.reset();
    this.editingDocument = null;
    this.selectedFile = null;
  }

  downloadDocument(document: Document): void {
    // TODO: Gerçek download işlemi yapılacak
    this.messageService.add({
      severity: 'info',
      summary: 'İndiriliyor',
      detail: `${document.fileName} indiriliyor...`
    });
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
} 