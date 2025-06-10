import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Environment configuration
const environment = {
  apiUrl: 'http://localhost:8080/api'
};

export interface Client {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  enabled: boolean;
  active: boolean;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  createdDate?: Date;
  updatedDate?: Date;
  roles?: any[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  /**
   * Get all clients
   */
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  /**
   * Get clients with pagination
   */
  getClientsPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Observable<PageResponse<Client>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Client>>(`${this.baseUrl}/paginated`, { params });
  }

  /**
   * Get client by ID
   */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new client
   */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  /**
   * Update existing client
   */
  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client);
  }

  /**
   * Delete client
   */
  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle client status
   */
  toggleClientStatus(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * Search clients
   */
  searchClients(query: string): Observable<Client[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Client[]>(`${this.baseUrl}/search`, { params });
  }

  /**
   * Get client statistics
   */
  getClientStats(): Observable<ClientStats> {
    return this.http.get<ClientStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Check if username exists
   */
  checkUsername(username: string): Observable<{ exists: boolean }> {
    const params = new HttpParams().set('username', username);
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-username`, { params });
  }

  /**
   * Check if email exists
   */
  checkEmail(email: string): Observable<{ exists: boolean }> {
    const params = new HttpParams().set('email', email);
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-email`, { params });
  }
} 