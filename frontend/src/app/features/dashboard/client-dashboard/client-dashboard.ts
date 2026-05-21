import { Component, OnInit, signal, computed } from '@angular/core';
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

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  userName = signal('');

  activeAppointment = computed(() =>
    this.appointments().find(a =>
      a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
    )
  );

  recentAppointments = computed(() =>
    this.appointments()
      .filter(a => a.status === 'DONE' || a.status === 'CANCELLED')
      .slice(0, 5)
  );

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName.set(this.authService.getUserName());
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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