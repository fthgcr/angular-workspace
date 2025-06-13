import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment configuration
const environment = {
  apiUrl: 'http://localhost:8080/api'
};

export interface Case {
  id?: number;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  type: CaseType;
  filingDate: Date;
  createdDate?: Date;
  updatedDate?: Date;
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
  };
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export enum CaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CaseType {
  CAR_DEPRECIATION = 'CAR_DEPRECIATION',
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  CORPORATE = 'CORPORATE',
  REAL_ESTATE = 'REAL_ESTATE',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  OTHER = 'OTHER'
}

export interface CaseCreateRequest {
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  type: CaseType;
  filingDate: string; // ISO date string for API
  assignedUserId?: number;
  clientId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private baseUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  /**
   * Get all cases
   */
  getAllCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.baseUrl);
  }

  /**
   * Get cases by user ID
   */
  getCasesByUserId(userId: number): Observable<Case[]> {
    return this.http.get<Case[]>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Get cases by client ID
   */
  getCasesByClientId(clientId: number): Observable<Case[]> {
    return this.http.get<Case[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /**
   * Get case by ID
   */
  getCaseById(id: number): Observable<Case> {
    const url = `${this.baseUrl}/${id}`;
    console.log('CaseService: Making request to:', url);
    console.log('CaseService: Base URL is:', this.baseUrl);
    console.log('CaseService: Full environment:', environment);
    return this.http.get<Case>(url);
  }

  /**
   * Create new case
   */
  createCase(caseData: CaseCreateRequest): Observable<Case> {
    return this.http.post<Case>(this.baseUrl, caseData);
  }

  /**
   * Update existing case
   */
  updateCase(id: number, caseData: CaseCreateRequest): Observable<Case> {
    return this.http.put<Case>(`${this.baseUrl}/${id}`, caseData);
  }

  /**
   * Delete case
   */
  deleteCase(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Generate case number
   */
  generateCaseNumber(): Observable<{caseNumber: string}> {
    return this.http.get<{caseNumber: string}>(`${this.baseUrl}/generate-number`);
  }
} 