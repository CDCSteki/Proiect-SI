import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  active: boolean;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/profile/password`, data);
  }
}