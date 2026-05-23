import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface RepairRecordRequest {
  diagnosis: string;
  laborHours: number;
}

export interface PartRequest {
  name: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class MechanicService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Leaves
  getMyLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mechanics/time-off`);
  }

  requestLeave(data: LeaveRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mechanics/time-off`, data);
  }

  deleteLeave(leaveId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mechanics/time-off/${leaveId}`);
  }

  // Repair Records
  getRepairRecord(appointmentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/repair-records/appointment/${appointmentId}`);
  }

  createRepairRecord(appointmentId: string, data: RepairRecordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/repair-records/appointment/${appointmentId}`, data);
  }

  addPart(repairRecordId: string, data: PartRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/repair-records/${repairRecordId}/parts`, data);
  }

  deletePart(partId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/repair-records/parts/${partId}`);
  }
}