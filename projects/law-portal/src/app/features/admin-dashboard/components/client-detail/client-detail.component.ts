import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Client } from '../../../../core/services/client.service';
import { Case, CaseStatus, CaseType } from '../case-management/case-management.component';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const clientId = this.route.snapshot.params['id'];
    this.loadClient(clientId);
    this.loadClientCases(clientId);
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
        active: true,
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
        active: true,
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
        active: true,
        phoneNumber: '+90 555 555 1234',
        address: 'Konak, İzmir',
        notes: 'Ticaret hukuku müvekkili',
        createdDate: new Date('2024-03-05')
      }
    ];

    this.client = clients.find(c => c.id == clientId) || null;
  }

  loadClientCases(clientId: number): void {
    this.loading = true;
    // TODO: API çağrısı yapılacak
    setTimeout(() => {
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

      this.clientCases = allCases.filter(c => c.assignedUserId == clientId);
      this.loading = false;
    }, 500);
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
} 