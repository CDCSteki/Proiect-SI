import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: string;
  clientId: string;
  mechanicId?: string;
  mechanicName?: string;
  serviceType: string;
  notes?: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'READY_FOR_PICKUP' | 'CANCELLED';
  car: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/my`);
  }

  bookAppointment(data: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, data);
  }

  cancelAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`);
  }

  updateStatus(id: string, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/status?status=${status}`, {});
  }

  assignMechanic(id: string, mechanicId: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/assign?mechanicId=${mechanicId}`, {});
  }

  getCalendar(from: string, to: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/calendar?from=${from}&to=${to}`);
  }

  getMyTasks(from: string, to: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/tasks?from=${from}&to=${to}`);
  }
}