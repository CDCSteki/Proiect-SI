import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { MechanicService } from '../../../core/services/mechanic';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, CommonModule, MainLayout],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.scss'
})
export class ClientDashboard implements OnInit {
  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  userName = signal('');

  showInvoiceModal = signal(false);
  selectedInvoice = signal<any>(null);
  selectedJobDetails = signal<Appointment | null>(null);

  acknowledgedIds = signal<string[]>(
    JSON.parse(localStorage.getItem('acknowledged_appointments') || '[]')
  );

  currentAppointments = computed(() => {
    return this.appointments()
      .filter(a => 
        a.status === 'SCHEDULED' || 
        a.status === 'IN_PROGRESS' || 
        a.status === 'DONE' || 
        (a.status === 'READY_FOR_PICKUP' && !this.acknowledgedIds().includes(a.id))
      )
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });

  recentAppointments = computed(() => {
    return this.appointments()
      .filter(a => 
        a.status === 'READY_FOR_PICKUP' && this.acknowledgedIds().includes(a.id)
      )
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private mechanicService: MechanicService
  ) {}

  ngOnInit(): void {
    const name = this.authService.getUserName();
    this.userName.set(name ? name : 'Client');
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewInvoice(appointment: Appointment): void {
    this.selectedJobDetails.set(appointment);
    this.showInvoiceModal.set(true);
    this.selectedInvoice.set(null);

    this.mechanicService.getRepairRecord(appointment.id).subscribe({
      next: (record) => this.selectedInvoice.set(record),
      error: () => this.selectedInvoice.set(null)
    });
  }

  acknowledgePickup(appointmentId: string): void {
    const updated = [...this.acknowledgedIds(), appointmentId];
    this.acknowledgedIds.set(updated);
    localStorage.setItem('acknowledged_appointments', JSON.stringify(updated));
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
      'DONE': 'Repair Completed',
      'READY_FOR_PICKUP': 'Ready for Pickup',
      'CANCELLED': 'Cancelled'
    };
    return map[status] || status;
  }
}