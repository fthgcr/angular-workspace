import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ClientService, ClientCase, ClientDocument } from '../../services/client.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { DocumentService } from '../../core/services/document.service'; // Fixed import path

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  standalone: false
})
export class ClientComponent implements OnInit, OnDestroy {

  // Data properties
  cases: ClientCase[] = [];
  selectedCase: ClientCase | null = null;
  caseDocuments: ClientDocument[] = [];
  
  // Loading states
  isLoadingCases = false;
  isLoadingDocuments = false;
  
  // UI states
  isDescriptionExpanded = false;

  private subscriptions = new Subscription();

  constructor(
    private clientService: ClientService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private documentService: DocumentService // Added DocumentService to constructor
  ) { }

  ngOnInit(): void {
    this.loadMyCases();
    
    // Subscribe to language changes
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(() => {
        // Language changed, component will be reloaded automatically
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load user's cases
   */
  loadMyCases(): void {
    this.isLoadingCases = true;
    
    this.clientService.getMyCases().subscribe({
      next: (cases) => {
        // Map backend data to frontend interface
        this.cases = cases.map(caseItem => ({
          ...caseItem,
          startDate: caseItem.startDate || caseItem.filingDate, // Use startDate or fallback to filingDate
          lawyerName: caseItem.lawyerName || 
                     (caseItem.assignedUser ? 
                      `${caseItem.assignedUser.firstName} ${caseItem.assignedUser.lastName}` : 
                      undefined)
        }));
        this.isLoadingCases = false;
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate('error'),
          detail: this.translate('error.loading.cases')
        });
        this.isLoadingCases = false;
      }
    });
  }

  /**
   * Handle case selection
   */
  onCaseSelect(selectedCase: ClientCase): void {
    this.selectedCase = selectedCase;
    this.isDescriptionExpanded = false;
    this.loadCaseDocuments(selectedCase.id);
  }

  /**
   * Load documents for selected case
   */
  loadCaseDocuments(caseId: number): void {
    this.isLoadingDocuments = true;
    this.caseDocuments = [];
    
    this.clientService.getDocumentsByCaseId(caseId).subscribe({
      next: (documents) => {
        // Map backend data to frontend interface
        this.caseDocuments = documents.map(doc => ({
          ...doc,
          uploadDate: doc.uploadDate || doc.createdDate // Use uploadDate or fallback to createdDate
        }));
        this.isLoadingDocuments = false;
        console.log(`Loaded ${this.caseDocuments.length} documents for case ${caseId}`);
      },
      error: (error) => {
        console.error('Error loading case documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate('error'),
          detail: this.translate('error.loading.documents')
        });
        this.isLoadingDocuments = false;
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
  getTruncatedDescription(description: string, limit: number = 150): string {
    if (!description) return '';
    if (description.length <= limit) return description;
    return description.substring(0, limit) + '...';
  }

  /**
   * Get active cases count
   */
  getActiveCasesCount(): number {
    return this.cases.filter(c => c.status !== 'closed').length;
  }

  /**
   * Get total documents count (estimated)
   */
  getTotalDocumentsCount(): number {
    // This is an estimation since we don't load all documents at once
    return this.cases.length * 3; // Assume average 3 documents per case
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadMyCases();
    if (this.selectedCase) {
      this.loadCaseDocuments(this.selectedCase.id);
    }
    
    this.messageService.add({
      severity: 'success',
      summary: this.translate('success'),
      detail: this.translate('data.refreshed')
    });
  }

  /**
   * Download document using base64 method
   */
  downloadDocument(doc: any): void {
    if (doc.id) {
      // Use base64 download method for client documents
      this.clientService.downloadDocumentAsBase64(doc.id).subscribe({
        next: (response) => {
          this.downloadBase64File(response.base64Content, doc.fileName, doc.contentType);
          this.messageService.add({
            severity: 'success',
            summary: this.translate('success'),
            detail: this.translate('success.file.downloaded').replace('{filename}', doc.fileName)
          });
        },
        error: (error: any) => {
          console.error('Error downloading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate('error'),
            detail: this.translate('error.downloading.file').replace('{filename}', doc.fileName)
          });
        }
      });
    }
  }

  /**
   * Download base64 file content
   */
  private downloadBase64File(base64Content: string, fileName: string, contentType: string): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate('error'),
        detail: 'Dosya dönüştürülürken hata oluştu'
      });
    }
  }

  /**
   * Get case type label
   */
  getCaseTypeLabel(type: string): string {
    switch (type?.toUpperCase()) {
      case 'CAR_DEPRECIATION':
        return this.translate('case.type.car.depreciation');
      case 'CIVIL':
        return this.translate('case.type.civil');
      case 'CRIMINAL':
        return this.translate('case.type.criminal');
      case 'FAMILY':
        return this.translate('case.type.family');
      case 'CORPORATE':
        return this.translate('case.type.corporate');
      case 'REAL_ESTATE':
        return this.translate('case.type.real.estate');
      case 'INTELLECTUAL_PROPERTY':
        return this.translate('case.type.intellectual.property');
      case 'OTHER':
        return this.translate('case.type.other');
      default:
        return type || this.translate('case.type.other');
    }
  }

  /**
   * Get status severity for PrimeNG Tag
   */
  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'closed':
        return 'success';
      default:
        return 'secondary';
    }
  }

  /**
   * Get document icon based on file type
   */
  getDocumentIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pi pi-file-pdf';
      case 'doc':
      case 'docx':
        return 'pi pi-file-word';
      case 'xls':
      case 'xlsx':
        return 'pi pi-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'pi pi-image';
      default:
        return 'pi pi-file';
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get translation for a key
   */
  translate(key: string): string {
    return this.languageService.translate(key);
  }
} 