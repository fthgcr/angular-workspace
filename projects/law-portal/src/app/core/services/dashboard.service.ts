import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment configuration
const environment = {
  apiUrl: 'http://localhost:8080/api'
};

export interface DashboardStats {
  totalClients: number;
  monthlyNewClients: number;
  clientGrowthPercentage: number;
  totalCases: number;
  activeCases: number;
  totalDocuments: number;
}

export interface ClientStatusSummary {
  activeClients: number;
  inactiveClients: number;
  totalClients: number;
}

export interface CaseTypeDistribution {
  type: string;
  count: number;
  typeName: string;
}

export interface CaseStatusDistribution {
  status: string;
  count: number;
  statusName: string;
}

export interface RecentActivity {
  id?: number;
  type: ActivityType;
  description: string;
  createdDate: string;
  icon: string;
  timeAgo: string;
  
  // User who performed the action
  performedBy: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  
  // Target entity details
  targetEntity: {
    id: number;
    name: string;
    type: 'CLIENT' | 'CASE' | 'DOCUMENT' | 'USER';
  };
  
  // Related entity (e.g., client for a case, case for a document)
  relatedEntity?: {
    id: number;
    name: string;
    type: 'CLIENT' | 'CASE' | 'DOCUMENT' | 'USER';
  };
  
  // Additional details specific to activity type
  details?: {
    [key: string]: any;
  };
}

export enum ActivityType {
  CLIENT_CREATED = 'CLIENT_CREATED',
  CLIENT_UPDATED = 'CLIENT_UPDATED',
  CLIENT_DELETED = 'CLIENT_DELETED',
  CASE_CREATED = 'CASE_CREATED',
  CASE_UPDATED = 'CASE_UPDATED',
  CASE_DELETED = 'CASE_DELETED',
  CASE_ASSIGNED = 'CASE_ASSIGNED',
  DOCUMENT_CREATED = 'DOCUMENT_CREATED',
  DOCUMENT_UPDATED = 'DOCUMENT_UPDATED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED'
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Get client status summary
   */
  getClientStatusSummary(): Observable<ClientStatusSummary> {
    return this.http.get<ClientStatusSummary>(`${this.baseUrl}/client-status`);
  }

  /**
   * Get case types distribution
   */
  getCaseTypesDistribution(): Observable<CaseTypeDistribution[]> {
    return this.http.get<CaseTypeDistribution[]>(`${this.baseUrl}/case-types`);
  }

  /**
   * Get case status distribution
   */
  getCaseStatusDistribution(): Observable<CaseStatusDistribution[]> {
    return this.http.get<CaseStatusDistribution[]>(`${this.baseUrl}/case-status`);
  }

  /**
   * Get recent activities
   */
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.baseUrl}/recent-activities`);
  }
} 