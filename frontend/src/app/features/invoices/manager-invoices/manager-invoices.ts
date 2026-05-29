import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ManagerService } from '../../../core/services/manager';
import { MechanicService } from '../../../core/services/mechanic';
import { AppointmentService } from '../../../core/services/appointment';

@Component({
  selector: 'app-manager-invoices',
  standalone: true,
  imports: [MainLayout, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './manager-invoices.html',
  styleUrl: './manager-invoices.scss'
})
export class ManagerInvoices implements OnInit {
  activeTab = signal<'pending' | 'generated'>('pending');
  loading = signal(true);
  generating = signal(false);
  showInvoiceModal = signal(false);

  allAppointments = signal<any[]>([]);
  selectedJob = signal<any>(null);
  repairRecord = signal<any>(null);

  pendingJobs = computed(() => {
    return this.allAppointments().filter(appt => appt.status === 'DONE');
  });

  generatedInvoices = computed(() => {
    return this.allAppointments().filter(appt => appt.status === 'READY_FOR_PICKUP');
  });

  constructor(
    private managerService: ManagerService,
    private mechanicService: MechanicService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const from = new Date();
    from.setDate(from.getDate() - 45);
    const to = new Date();
    to.setDate(to.getDate() + 1);

    this.managerService.getCalendar(from.toISOString().slice(0, 19), to.toISOString().slice(0, 19)).subscribe({
      next: (appointments) => {
        this.allAppointments.set(appointments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openInvoiceModal(job: any): void {
    this.selectedJob.set(job);
    this.repairRecord.set(null);
    this.showInvoiceModal.set(true);

    this.mechanicService.getRepairRecord(job.id).subscribe({
      next: (record) => this.repairRecord.set(record),
      error: () => this.repairRecord.set(null)
    });
  }

  generateInvoice(): void {
    const job = this.selectedJob();
    if (!job) return;

    this.generating.set(true);
    this.appointmentService.updateStatus(job.id, 'READY_FOR_PICKUP').subscribe({
      next: () => {
        this.generating.set(false);
        this.showInvoiceModal.set(false);
        this.loadData();
      },
      error: () => this.generating.set(false)
    });
  }
}