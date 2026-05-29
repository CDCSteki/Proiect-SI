import { Component, OnInit, signal, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';
import { MechanicService } from '../../../core/services/mechanic';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [MainLayout, RouterLink, DatePipe, DecimalPipe, CommonModule, ConfirmDialog],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentList implements OnInit {
  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  selectedStatus = signal<string>('ALL');
  selectedCarId = signal<string>('ALL');

  showInvoiceModal = signal(false);
  selectedInvoice = signal<any>(null);
  selectedJobDetails = signal<Appointment | null>(null);

  confirmDialog = viewChild.required(ConfirmDialog);

  acknowledgedIds = signal<string[]>(
    JSON.parse(localStorage.getItem('acknowledged_appointments') || '[]')
  );

  uniqueCars = computed(() => {
    const carsMap = new Map<string, any>();
    this.appointments().forEach(a => {
      if (a.car) {
        carsMap.set(a.car.id, a.car);
      }
    });
    return Array.from(carsMap.values());
  });

  filteredAppointments = computed(() => {
    let list = this.appointments();

    if (this.selectedStatus() !== 'ALL') {
      list = list.filter(a => a.status === this.selectedStatus());
    }

    if (this.selectedCarId() !== 'ALL') {
      list = list.filter(a => a.car?.id === this.selectedCarId());
    }

    return list.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  statuses = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'DONE', 'READY_FOR_PICKUP', 'CANCELLED'];

  constructor(
    private appointmentService: AppointmentService,
    private mechanicService: MechanicService
  ) {}

  ngOnInit(): void {
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

  setFilter(status: string): void {
    this.selectedStatus.set(status);
  }

  onCarFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCarId.set(value);
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

  isPickedUp(appointmentId: string): boolean {
    return this.acknowledgedIds().includes(appointmentId);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'badge-blue',
      'IN_PROGRESS': 'badge-warn',
      'DONE': 'badge-warn',
      'READY_FOR_PICKUP': 'badge-green',
      'CANCELLED': 'badge-danger'
    };
    return map[status] || 'badge-gray';
  }

  getStatusLabel(status: string, id: string): string {
    if (status === 'READY_FOR_PICKUP' && this.isPickedUp(id)) {
      return 'Picked Up';
    }
    const map: Record<string, string> = {
      'SCHEDULED': 'Scheduled',
      'IN_PROGRESS': 'In Progress',
      'DONE': 'Repair Completed',
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
        this.loadAppointments();
      }
    });
  }
}