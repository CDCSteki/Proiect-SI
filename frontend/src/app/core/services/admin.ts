import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  phoneNumber: string;
}

export interface ChangeRoleRequest {
  role: string;
  specialization?: string;
  hourlyRate?: number;
  department?: string;
  accessLevel?: number;
}

export interface StatsResponse {
  clients: number;
  mechanics: number;
  managers: number;
  admins: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }

  toggleActive(userId: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${userId}/toggle-active`, {});
  }

  changeRole(userId: string, request: ChangeRoleRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${userId}/role`, request);
  }

  getUsersCount(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/users-count`);
  }

  getTotalRevenue(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/total-revenue`);
  }

  getAppointmentsByStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/appointments-status`);
  }
}