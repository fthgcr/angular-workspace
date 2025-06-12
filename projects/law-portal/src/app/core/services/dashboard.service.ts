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
} 