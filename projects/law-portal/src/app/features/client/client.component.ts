import { Component, OnInit } from '@angular/core';

interface Case {
  id: number;
  title: string;
  status: string;
  createdDate: Date;
  description: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: Date;
  size: string;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  standalone: false // Module-based component
})
export class ClientComponent implements OnInit {

  // Accordion data
  cases: Case[] = [];
  documents: Document[] = [];
  thirdAccordionData: any[] = []; // Placeholder for future
  fourthAccordionData: any[] = []; // Placeholder for future

  // Accordion states
  accordionStates: { [key: number]: boolean } = {
    1: true,  // İlk akordiyon açık başlasın
    2: false,
    3: false,
    4: false
  };

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  toggleAccordion(index: number): void {
    this.accordionStates[index] = !this.accordionStates[index];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    // Convert English status to Turkish labels
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'PENDING': return 'Beklemede';
      case 'CLOSED': return 'Kapalı';
      // Legacy status values (keep for backwards compatibility)
      case 'Devam Ediyor': return 'Devam Ediyor';
      case 'Tamamlandı': return 'Kapalı';
      case 'Beklemede': return 'Beklemede';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    const label = this.getStatusLabel(status);
    switch (label) {
      case 'Açık': return 'status-tag status-info';
      case 'Devam Ediyor': return 'status-tag status-warning';
      case 'Beklemede': return 'status-tag status-secondary';
      case 'Kapalı': return 'status-tag status-success';
      default: return 'status-tag status-secondary';
    }
  }

  getStatusSeverity(status: string): string {
    const label = this.getStatusLabel(status);
    switch (label) {
      case 'Açık': return 'info';
      case 'Devam Ediyor': return 'warning';
      case 'Beklemede': return 'secondary';
      case 'Kapalı': return 'success';
      default: return 'secondary';
    }
  }

  private loadMockData(): void {
    // Mock cases data
    this.cases = [
      {
        id: 1,
        title: 'Boşanma Davası',
        status: 'Devam Ediyor',
        createdDate: new Date('2024-01-15'),
        description: 'Mal paylaşımı ile ilgili boşanma davası'
      },
      {
        id: 2,
        title: 'İcra Takibi',
        status: 'Tamamlandı',
        createdDate: new Date('2023-12-10'),
        description: 'Alacak tahsili için açılan icra takibi'
      },
      {
        id: 3,
        title: 'İş Mahkemesi',
        status: 'Beklemede',
        createdDate: new Date('2024-02-20'),
        description: 'İşten çıkarma tazminatı davası'
      }
    ];

    // Mock documents data
    this.documents = [
      {
        id: 1,
        name: 'Boşanma Dilekçesi.pdf',
        type: 'PDF',
        uploadDate: new Date('2024-01-16'),
        size: '2.5 MB'
      },
      {
        id: 2,
        name: 'Kimlik Fotokopisi.jpg',
        type: 'JPG',
        uploadDate: new Date('2024-01-15'),
        size: '850 KB'
      },
      {
        id: 3,
        name: 'Evlilik Cüzdanı.pdf',
        type: 'PDF',
        uploadDate: new Date('2024-01-15'),
        size: '1.2 MB'
      }
    ];
  }
} 