import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Document {
  id?: number;
  title: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  type: DocumentType;
  storageType?: string;
  isPrivate?: boolean;
  base64Content?: string; // Only populated when specifically requested
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

export interface CreateBase64DocumentRequest {
  title: string;
  description?: string;
  type: DocumentType;
  legalCaseId: number;
  fileName: string;
  contentType: string;
  base64Content: string;
}

export interface DocumentDownloadResponse {
  base64Content: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  title: string;
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
   * Upload document (traditional file upload - still works)
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
   * Create document from base64 content
   */
  createDocumentFromBase64(request: CreateBase64DocumentRequest): Observable<Document> {
    return this.http.post<Document>(`${this.baseUrl}/create-base64`, request);
  }

  /**
   * Upload file and convert to base64 document
   */
  uploadFileAsBase64(file: File, documentData: DocumentCreateRequest): Observable<Document> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1]; // Remove data:mime;base64, prefix
        
        const base64Request: CreateBase64DocumentRequest = {
          title: documentData.title,
          description: documentData.description,
          type: documentData.type,
          legalCaseId: documentData.legalCaseId,
          fileName: file.name,
          contentType: file.type,
          base64Content: base64Content
        };

        this.createDocumentFromBase64(base64Request).subscribe({
          next: (document) => observer.next(document),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };

      reader.onerror = () => observer.error('File reading failed');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Download document as base64
   */
  downloadDocumentAsBase64(id: number): Observable<DocumentDownloadResponse> {
    return this.http.get<DocumentDownloadResponse>(`${this.baseUrl}/${id}/download-base64`);
  }

  /**
   * Download document as blob (traditional download)
   */
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Download document as base64 and trigger browser download
   */
  downloadDocumentAsFile(id: number): Observable<void> {
    return new Observable(observer => {
      this.downloadDocumentAsBase64(id).subscribe({
        next: (response) => {
          // Convert base64 to blob
          const byteCharacters = atob(response.base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: response.contentType });

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = response.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Update existing document metadata
   */
  updateDocument(id: number, documentData: {title: string, description?: string, type: DocumentType}): Observable<Document> {
    return this.http.put<Document>(`${this.baseUrl}/${id}`, documentData);
  }

  /**
   * Delete document
   */
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Search documents by title
   */
  searchDocumentsByTitle(title: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.baseUrl}/search/title`, {
      params: { title }
    });
  }

  /**
   * Search documents by file name
   */
  searchDocumentsByFileName(fileName: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.baseUrl}/search/filename`, {
      params: { fileName }
    });
  }

  /**
   * Get storage statistics (admin only)
   */
  getStorageStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/storage-stats`);
  }

  /**
   * Get system configuration
   */
  getConfig(): Observable<any> {
    return this.http.get(`${this.baseUrl}/config`);
  }

  /**
   * Utility: Convert file to base64 string
   */
  fileToBase64(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove data:mime;base64, prefix
        observer.next(base64);
        observer.complete();
      };
      reader.onerror = () => observer.error('File reading failed');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Utility: Convert base64 to blob
   */
  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  /**
   * Utility: Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 