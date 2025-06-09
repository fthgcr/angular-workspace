import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Case, CaseStatus, CaseType } from '../case-management/case-management.component';
import { Client } from '../client-management/client-management.component';
import { Document, DocumentType } from '../document-management/document-management.component';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.scss']
})
export class CaseDetailComponent implements OnInit {
  case: Case | null = null;
  client: Client | null = null;
  caseDocuments: Document[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const caseId = this.route.snapshot.params['id'];
    this.loadCase(caseId);
    this.loadCaseDocuments(caseId);
  }

  loadCase(caseId: number): void {
    // TODO: API çağrısı yapılacak
    const allCases = [
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
      },
      {
        id: 3,
        caseNumber: 'CASE-2024-003',
        title: 'Ticaret Uyuşmazlığı',
        description: 'Sözleşme ihlali davası',
        status: CaseStatus.PENDING,
        type: CaseType.CORPORATE,
        filingDate: new Date('2024-03-05'),
        assignedUserId: 3,
        createdDate: new Date('2024-03-05')
      }
    ];

    this.case = allCases.find(c => c.id == caseId) || null;
    
    if (this.case && this.case.assignedUserId) {
      this.loadClient(this.case.assignedUserId);
    }
  }

  loadClient(clientId: number): void {
    // TODO: API çağrısı yapılacak
    const clients = [
      {
        id: 1,
        username: 'ahmet.yilmaz',
        email: 'ahmet.yilmaz@email.com',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        enabled: true,
        phoneNumber: '+90 555 123 4567',
        address: 'Beşiktaş, İstanbul',
        notes: 'İş hukuku uzmanı avukat',
        createdDate: new Date('2024-01-15')
      },
      {
        id: 2,
        username: 'zeynep.kaya',
        email: 'zeynep.kaya@email.com',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        enabled: true,
        phoneNumber: '+90 555 987 6543',
        address: 'Çankaya, Ankara',
        notes: 'Aile hukuku davalarında müvekkil',
        createdDate: new Date('2024-02-10')
      },
      {
        id: 3,
        username: 'mehmet.celik',
        email: 'mehmet.celik@email.com',
        firstName: 'Mehmet',
        lastName: 'Çelik',
        enabled: true,
        phoneNumber: '+90 555 555 1234',
        address: 'Konak, İzmir',
        notes: 'Ticaret hukuku müvekkili',
        createdDate: new Date('2024-03-05')
      }
    ];

    this.client = clients.find(c => c.id == clientId) || null;
  }

  loadCaseDocuments(caseId: number): void {
    this.loading = true;
    // TODO: API çağrısı yapılacak
    setTimeout(() => {
      const allDocuments = [
        {
          id: 1,
          title: 'İş Sözleşmesi',
          description: 'Müvekkil ile işveren arasındaki sözleşme',
          fileName: 'is-sozlesmesi.pdf',
          fileSize: 524288,
          contentType: 'application/pdf',
          type: DocumentType.CONTRACT,
          caseId: 1,
          uploadDate: new Date('2024-01-16'),
          createdDate: new Date('2024-01-16')
        },
        {
          id: 2,
          title: 'Dilekçe',
          description: 'Mahkemeye sunulan dilekçe',
          fileName: 'dilekce.pdf',
          fileSize: 1048576,
          contentType: 'application/pdf',
          type: DocumentType.COMPLAINT,
          caseId: 1,
          uploadDate: new Date('2024-01-20'),
          createdDate: new Date('2024-01-20')
        },
        {
          id: 3,
          title: 'Evlilik Cüzdanı',
          description: 'Evlilik belgesi fotokopisi',
          fileName: 'evlilik-cuzdani.pdf',
          fileSize: 256000,
          contentType: 'application/pdf',
          type: DocumentType.EXHIBIT,
          caseId: 2,
          uploadDate: new Date('2024-02-11'),
          createdDate: new Date('2024-02-11')
        },
        {
          id: 4,
          title: 'Şirket Sözleşmesi',
          description: 'Ana sözleşme belgesi',
          fileName: 'sirket-sozlesmesi.pdf',
          fileSize: 2048000,
          contentType: 'application/pdf',
          type: DocumentType.CONTRACT,
          caseId: 3,
          uploadDate: new Date('2024-03-06'),
          createdDate: new Date('2024-03-06')
        }
      ];

      this.caseDocuments = allDocuments.filter(d => d.caseId == caseId);
      this.loading = false;
    }, 500);
  }

  goBack(): void {
    if (this.client) {
      this.router.navigate(['/admin/client', this.client.id]);
    } else {
      this.router.navigate(['/admin'], { queryParams: { tab: 'cases' } });
    }
  }

  downloadDocument(document: Document): void {
    // TODO: Dosya indirme işlemi
    this.messageService.add({
      severity: 'info',
      summary: 'İndirme',
      detail: `${document.fileName} dosyası indiriliyor...`
    });
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

  getDocumentTypeLabel(type: DocumentType): string {
    switch (type) {
      case DocumentType.COMPLAINT: return 'Şikayet';
      case DocumentType.ANSWER: return 'Cevap';
      case DocumentType.MOTION: return 'Dilekçe';
      case DocumentType.EXHIBIT: return 'Delil';
      case DocumentType.CONTRACT: return 'Sözleşme';
      case DocumentType.CORRESPONDENCE: return 'Yazışma';
      case DocumentType.OTHER: return 'Diğer';
      default: return type;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pi pi-file-pdf';
      case 'doc':
      case 'docx': return 'pi pi-file-word';
      case 'xls':
      case 'xlsx': return 'pi pi-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'pi pi-image';
      default: return 'pi pi-file';
    }
  }
} 