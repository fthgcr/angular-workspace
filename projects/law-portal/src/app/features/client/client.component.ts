import { Component, OnInit } from '@angular/core';
import { ClientService, ClientCase, ClientDocument } from '../../services/client.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  standalone: false
})
export class ClientComponent implements OnInit {

  // Data properties
  cases: ClientCase[] = [];
  selectedCase: ClientCase | null = null;
  caseDocuments: ClientDocument[] = [];
  
  // Loading states
  loading = false;
  loadingDocuments = false;
  
  // UI states
  isDescriptionExpanded = false;

  constructor(
    private clientService: ClientService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCases();
  }

  /**
   * Load all cases for the current client
   */
  private loadCases(): void {
    this.loading = true;
    
    this.clientService.getMyCases().subscribe({
      next: (cases) => {
        this.cases = cases || [];
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

  /**
   * Handle case selection from table
   */
  onCaseSelect(event: any): void {
    this.selectedCase = event.data;
    this.isDescriptionExpanded = false; // Reset description state
    if (this.selectedCase) {
      this.loadCaseDocuments(this.selectedCase.id);
    }
  }

  /**
   * Load documents for selected case
   */
  private loadCaseDocuments(caseId: number): void {
    this.loadingDocuments = true;
    this.caseDocuments = [];
    
    this.clientService.getDocumentsByCaseId(caseId).subscribe({
      next: (documents) => {
        this.caseDocuments = documents || [];
        this.loadingDocuments = false;
      },
      error: (error) => {
        console.error('Error loading case documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Dava dosyaları yüklenirken bir hata oluştu'
        });
        this.loadingDocuments = false;
      }
    });
  }

  /**
   * Clear case selection
   */
  clearSelection(): void {
    this.selectedCase = null;
    this.caseDocuments = [];
    this.isDescriptionExpanded = false;
  }

  /**
   * Toggle description expansion
   */
  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  /**
   * Get truncated description
   */
  getTruncatedDescription(description: string, maxLength: number = 150): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Check if description needs truncation
   */
  shouldTruncateDescription(description: string, maxLength: number = 150): boolean {
    return !!(description && description.length > maxLength);
  }

  /**
   * Get active cases count
   */
  getActiveCasesCount(): number {
    return this.cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  }

  /**
   * Get total documents count (estimated)
   */
  getTotalDocumentsCount(): number {
    // Since we don't load all documents at once, we'll show selected case documents count
    // or a placeholder if no case is selected
    return this.selectedCase ? this.caseDocuments.length : this.cases.length * 2; // Estimate
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadCases();
    if (this.selectedCase) {
      this.loadCaseDocuments(this.selectedCase.id);
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Veriler yenilendi'
    });
  }



  /**
   * Download document
   */
  downloadDocument(doc: ClientDocument): void {
    this.clientService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Dosya indirildi'
        });
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Dosya indirilirken bir hata oluştu'
        });
      }
    });
  }

  /**
   * Format date string
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get status label in Turkish
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'PENDING': return 'Beklemede';
      case 'CLOSED': return 'Kapalı';
      default: return status;
    }
  }

  /**
   * Get status severity for PrimeNG tag
   */
  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'OPEN': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING': return 'secondary';
      case 'CLOSED': return 'success';
      default: return 'secondary';
    }
  }

  /**
   * Get case type label in Turkish
   */
  getCaseTypeLabel(type: string): string {
    switch (type) {
      case 'CAR_DEPRECIATION': return 'Araç Değer Kaybı';
      case 'CIVIL': return 'Hukuk';
      case 'CRIMINAL': return 'Ceza';
      case 'FAMILY': return 'Aile';
      case 'CORPORATE': return 'Şirket';
      case 'REAL_ESTATE': return 'Gayrimenkul';
      case 'INTELLECTUAL_PROPERTY': return 'Fikri Mülkiyet';
      case 'OTHER': return 'Diğer';
      default: return type;
    }
  }

  /**
   * Get document icon based on type
   */
  getDocumentIcon(type: string): string {
    switch (type.toUpperCase()) {
      case 'PDF': return 'pi pi-file-pdf';
      case 'DOC':
      case 'DOCX': return 'pi pi-file-word';
      case 'XLS':
      case 'XLSX': return 'pi pi-file-excel';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'GIF': return 'pi pi-image';
      case 'TXT': return 'pi pi-file';
      default: return 'pi pi-file';
    }
  }
} 