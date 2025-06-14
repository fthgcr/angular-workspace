import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  enabled: boolean;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) { }

  getCurrentUserProfile(): Observable<UserProfile> {
    const url = `${environment.infraCoreUrl}/user/profile`;
    return this.http.get<UserProfile>(url);
  }

  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    const url = `${environment.infraCoreUrl}/user/profile`;
    return this.http.put<UserProfile>(url, profile);
  }
} 