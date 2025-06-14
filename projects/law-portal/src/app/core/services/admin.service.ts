import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'shared-lib';

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  roles?: string[];
  enabled: boolean;
  active?: boolean;
  createdDate?: Date;
}

export interface Role {
  id: number;
  name: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  role: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.infraCoreUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getAllLawyers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/lawyers`);
  }

  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  updateUser(userId: number, userData: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
} 