import { Component, OnInit, signal, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [MainLayout, RouterLink, DatePipe, ConfirmDialog],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentList implements OnInit {

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  selectedStatus = signal<string>('ALL');

  confirmDialog = viewChild.required(ConfirmDialog);

  filteredAppointments = computed(() => {
    if (this.selectedStatus() === 'ALL') return this.appointments();
    return this.appointments().filter(a => a.status === this.selectedStatus());
  });

  statuses = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'DONE', 'READY_FOR_PICKUP', 'CANCELLED'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(status: string): void {
    this.selectedStatus.set(status);
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

  canCancel(status: string): boolean {
    return status === 'SCHEDULED';
  }

  async cancelAppointment(id: string): Promise<void> {
    const confirmed = await this.confirmDialog().open(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.'
    );

    if (!confirmed) return;

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.appointments.update(appts =>
          appts.map(a => a.id === id ? { ...a, status: 'CANCELLED' as any } : a)
        );
      },
      error: (err) => alert(err.error?.message || 'Failed to cancel.')
    });
  }
}