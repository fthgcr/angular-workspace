import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientCase {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  type: string;
  filingDate: string;
  startDate: string;
  lawyerName?: string;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ClientDocument {
  id: number;
  title: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  type: string;
  createdDate: string;
  uploadDate: string;
  legalCaseId: number;
  legalCaseTitle?: string;
  legalCaseNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Get current client's own cases
   */
  getMyCases(): Observable<ClientCase[]> {
    return this.http.get<ClientCase[]>(`${this.apiUrl}/cases/my-cases`);
  }

  /**
   * Get current client's own documents (from all their cases)
   */
  getMyDocuments(): Observable<ClientDocument[]> {
    return this.http.get<ClientDocument[]>(`${this.apiUrl}/documents/my-documents`);
  }

  /**
   * Get documents by case ID - Client can access documents for their own cases
   */
  getDocumentsByCaseId(caseId: number): Observable<ClientDocument[]> {
    return this.http.get<ClientDocument[]>(`${this.apiUrl}/documents/case/${caseId}`);
  }

  /**
   * Download document as blob (for traditional download)
   */
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Download document as base64 (for current implementation)
   */
  downloadDocumentAsBase64(documentId: number): Observable<{base64Content: string}> {
    return this.http.get<{base64Content: string}>(`${this.apiUrl}/documents/${documentId}/download-base64`);
  }

  /**
   * Get specific case by ID (client can access their own cases)
   */
  getCaseById(caseId: number): Observable<ClientCase> {
    return this.http.get<ClientCase>(`${this.apiUrl}/cases/${caseId}`);
  }
} 