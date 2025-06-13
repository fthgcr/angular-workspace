import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment configuration
const environment = {
  apiUrl: 'http://localhost:8080/api'
};

export interface Document {
  id?: number;
  title: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  type: DocumentType;
  createdDate?: Date;
  updatedDate?: Date;
  
  // Case information
  legalCaseId?: number;
  legalCaseTitle?: string;
  legalCaseNumber?: string;
  
  // Client information
  clientId?: number;
  clientName?: string;
  
  // Assigned user information
  assignedUserId?: number;
  assignedUserName?: string;
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

export interface DocumentCreateRequest {
  title: string;
  description?: string;
  type: DocumentType;
  legalCaseId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  /**
   * Get all documents sorted by creation date in descending order
   */
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.baseUrl);
  }

  /**
   * Get documents by case ID
   */
  getDocumentsByCaseId(caseId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.baseUrl}/case/${caseId}`);
  }

  /**
   * Get document by ID
   */
  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new document
   */
  createDocument(documentData: DocumentCreateRequest): Observable<Document> {
    return this.http.post<Document>(this.baseUrl, documentData);
  }

  /**
   * Update existing document
   */
  updateDocument(id: number, documentData: DocumentCreateRequest): Observable<Document> {
    return this.http.put<Document>(`${this.baseUrl}/${id}`, documentData);
  }

  /**
   * Delete document
   */
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Upload document file
   */
  uploadDocument(file: File, documentData: DocumentCreateRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', documentData.title);
    formData.append('type', documentData.type);
    formData.append('legalCaseId', documentData.legalCaseId.toString());
    if (documentData.description) {
      formData.append('description', documentData.description);
    }

    return this.http.post<Document>(`${this.baseUrl}/upload`, formData);
  }

  /**
   * Download document
   */
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { 
      responseType: 'blob' 
    });
  }
} 