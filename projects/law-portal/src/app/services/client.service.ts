import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'shared-lib';

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
  description?: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  type: string;
  createdDate: string;
  uploadDate: string;
  legalCase: {
    id: number;
    title: string;
    caseNumber: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.infraCoreUrl}`;

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
   * Download document
   */
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Get documents by case ID
   */
  getDocumentsByCaseId(caseId: number): Observable<ClientDocument[]> {
    return this.http.get<ClientDocument[]>(`${this.apiUrl}/documents/case/${caseId}`);
  }
} 