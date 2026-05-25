import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

  // Semnale pentru noul pop-up custom de confirmare/notificare
  customAlert = signal<{ show: boolean; title: string; message: string; type: 'confirm' | 'info'; action?: () => void }>({
    show: false, title: '', message: '', type: 'info'
  });

  allAppointments = signal<any[]>([]);
  selectedJob = signal<any>(null);
  repairRecord = signal<any>(null);
  currentInvoice = signal<any>(null); // Păstrează detaliile facturii curente, inclusiv laborCost

  private apiUrl = 'http://localhost:8080/api';

  pendingJobs = computed(() => {
    return this.allAppointments().filter(appt => appt.status === 'DONE');
  });

  generatedInvoices = computed(() => {
    return this.allAppointments().filter(appt => appt.status === 'READY_FOR_PICKUP');
  });

  constructor(
    private managerService: ManagerService,
    private mechanicService: MechanicService,
    private appointmentService: AppointmentService,
    private http: HttpClient
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
        
        // Pre-încărcăm starea de plată a facturilor pentru tab-ul de generate
        appointments.forEach((job: any) => {
          if (job.status === 'READY_FOR_PICKUP') {
            this.mechanicService.getRepairRecord(job.id).subscribe({
              next: (record: any) => {
                if (record) {
                  this.http.get<any>(`${this.apiUrl}/invoices/repair-record/${record.id}`).subscribe({
                    next: (invoice) => {
                      job.isPaid = invoice.paid;
                    },
                    error: () => job.isPaid = false
                  });
                }
              }
            });
          }
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openInvoiceModal(job: any): void {
    this.selectedJob.set(job);
    this.repairRecord.set(null);
    this.currentInvoice.set(null);
    this.showInvoiceModal.set(true);

    this.mechanicService.getRepairRecord(job.id).subscribe({
      next: (record) => {
        this.repairRecord.set(record);
        // Preluăm detaliile facturii pentru a citi laborCost și invoiceNumber
        this.http.get<any>(`${this.apiUrl}/invoices/repair-record/${record.id}`).subscribe({
          next: (invoice) => this.currentInvoice.set(invoice),
          error: () => this.currentInvoice.set(null)
        });
      },
      error: () => this.repairRecord.set(null)
    });
  }

  generateInvoice(): void {
    const job = this.selectedJob();
    const record = this.repairRecord();
    if (!job || !record) return;

    this.generating.set(true);

    this.http.post(`${this.apiUrl}/invoices/repair-record/${record.id}`, {}).subscribe({
      next: () => {
        this.appointmentService.updateStatus(job.id, 'READY_FOR_PICKUP').subscribe({
          next: () => {
            this.generating.set(false);
            this.showInvoiceModal.set(false);
            this.loadData();
            this.showAlert('Success', 'Invoice generated successfully.', 'info');
          },
          error: () => this.generating.set(false)
        });
      },
      error: () => this.generating.set(false)
    });
  }

  markAsPaid(job: any): void {
    this.customAlert.set({
      show: true,
      title: 'Confirm Payment',
      message: 'Are you sure you want to mark this invoice as Paid? Revenue data will be updated dynamically.',
      type: 'confirm',
      action: () => {
        this.mechanicService.getRepairRecord(job.id).subscribe({
          next: (record: any) => {
            this.http.get<any>(`${this.apiUrl}/invoices/repair-record/${record.id}`).subscribe({
              next: (invoice: any) => {
                this.http.patch(`${this.apiUrl}/invoices/${invoice.id}/pay`, {}).subscribe({
                  next: () => {
                    // Actualizăm starea local instanțiată pentru a ascunde butonul instantaneu
                    job.isPaid = true;
                    this.allAppointments.set([...this.allAppointments()]);
                    this.showAlert('Payment Successful', 'The invoice has been registered as fully paid.', 'info');
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  showAlert(title: string, message: string, type: 'confirm' | 'info') {
    this.customAlert.set({ show: true, title, message, type });
  }

  closeAlert() {
    this.customAlert.update(state => ({ ...state, show: false }));
  }
}