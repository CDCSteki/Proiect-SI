import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, MainLayout],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.scss'
})
export class ClientDashboard implements OnInit {

  appointments: Appointment[] = [];
  loading = true;
  userName = '';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.userName = this.authService.getUserName();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get activeAppointment(): Appointment | undefined {
    return this.appointments.find(a =>
      a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
    );
  }

  get recentAppointments(): Appointment[] {
    return this.appointments
      .filter(a => a.status === 'DONE' || a.status === 'CANCELLED')
      .slice(0, 5);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'badge-blue',
      'IN_PROGRESS': 'badge-warn',
      'DONE': 'badge-green',
      'READY_FOR_PICKUP': 'badge-green',
      'CANCELLED': 'badge-danger'
    };
    return map[status] || 'badge-gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'Scheduled',
      'IN_PROGRESS': 'In Progress',
      'DONE': 'Done',
      'READY_FOR_PICKUP': 'Ready for Pickup',
      'CANCELLED': 'Cancelled'
    };
    return map[status] || status;
  }
}