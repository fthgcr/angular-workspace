import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../shared-lib/src/lib/environments/environment';

export interface Document {
  id?: number;
  caseId: number;
  title: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  type: DocumentType;
  filePath?: string;
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

export interface DocumentUploadRequest {
  caseId: number;
  title: string;
  description?: string;
  type: DocumentType;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.infraCoreUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocumentsByCaseId(caseId: number): Observable<Document[]> {
    const url = `${this.apiUrl}/case/${caseId}`;
    console.log('DocumentService: Making request to:', url);
    return this.http.get<Document[]>(url);
  }

  uploadDocument(file: File, request: DocumentUploadRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', request.title);
    formData.append('type', request.type);
    if (request.description) {
      formData.append('description', request.description);
    }

    return this.http.post<Document>(`${this.apiUrl}/case/${request.caseId}/upload`, formData);
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, { 
      responseType: 'blob' 
    });
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }

  updateDocument(documentId: number, request: Partial<DocumentUploadRequest>): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${documentId}`, request);
  }
} 