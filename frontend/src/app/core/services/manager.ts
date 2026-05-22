import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvailableMechanic {
  mechanicId: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

export interface StatsResponse {
  scheduled: number;
  inProgress: number;
  done: number;
  cancelled: number;
}

@Injectable({ providedIn: 'root' })
export class ManagerService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getCalendar(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/calendar?from=${from}&to=${to}`);
  }

  getUnassigned(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/unassigned`);
  }

  getAvailableMechanics(timeSlot: string): Observable<AvailableMechanic[]> {
    return this.http.get<AvailableMechanic[]>(`${this.apiUrl}/mechanics/available?timeSlot=${timeSlot}`);
  }

  assignMechanic(appointmentId: string, mechanicId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/appointments/${appointmentId}/assign?mechanicId=${mechanicId}`, {});
  }

  getAppointmentsByStatus(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/appointments-status`);
  }

  getRevenue(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/revenue?startDate=${startDate}&endDate=${endDate}`);
  }

  getPendingLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mechanics/time-off/pending`);
  }

  approveLeave(leaveId: string, approved: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mechanics/time-off/${leaveId}/approve?approved=${approved}`, {});
  }

  getAppointmentsCount(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/appointments-count?startDate=${startDate}&endDate=${endDate}`);
  }
}