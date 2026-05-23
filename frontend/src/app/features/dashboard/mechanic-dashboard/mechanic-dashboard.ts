import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';
import { MechanicService } from '../../../core/services/mechanic';

@Component({
  selector: 'app-mechanic-dashboard', // <-- Selectorul original
  standalone: true,
  imports: [MainLayout, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './mechanic-dashboard.html',
  styleUrl: './mechanic-dashboard.scss'
})
export class MechanicDashboard implements OnInit { // <-- Numele clasei original
  today = new Date();
  loading = signal(true);
  allTasks = signal<Appointment[]>([]);
  currentRepairRecord = signal<any>(null);
  selectedTask = signal<any>(null);
  showRepairModal = signal(false);

  repairForm = { diagnosis: '', laborHours: 0 };
  partForm = { name: '', price: 0, quantity: 1 };

  activeTasks = computed(() => {
    const todayStr = this.today.toISOString().slice(0, 10);
    return this.allTasks().filter(t => {
      const isToday = t.scheduledAt.startsWith(todayStr);
      const isPast = t.scheduledAt.slice(0, 10) < todayStr;
      const isUnfinished = t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS';
      
      return (isToday && isUnfinished) || (isPast && isUnfinished);
    });
  });

  inProgressCount = computed(() => this.allTasks().filter(t => t.status === 'IN_PROGRESS').length);

  constructor(
    private appointmentService: AppointmentService,
    private mechanicService: MechanicService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    
    this.appointmentService.getMyTasks(from.toISOString().slice(0, 19), to.toISOString().slice(0, 19)).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startTask(appointmentId: string): void {
    this.appointmentService.updateStatus(appointmentId, 'IN_PROGRESS').subscribe({
      next: () => this.loadTasks()
    });
  }

  completeTask(appointmentId: string): void {
    this.appointmentService.updateStatus(appointmentId, 'DONE').subscribe({
      next: () => this.loadTasks()
    });
  }

  openRepairModal(task: Appointment): void {
    this.selectedTask.set(task);
    this.showRepairModal.set(true);
    this.repairForm = { diagnosis: '', laborHours: 0 };
    
    this.mechanicService.getRepairRecord(task.id).subscribe({
      next: (record) => {
        this.currentRepairRecord.set(record);
        this.repairForm = { diagnosis: record.diagnosis, laborHours: record.laborHours };
      },
      error: () => this.currentRepairRecord.set(null)
    });
  }

  saveRepairRecord(): void {
    const task = this.selectedTask();
    if (!task) return;

    this.mechanicService.createRepairRecord(task.id, this.repairForm).subscribe({
      next: (record) => {
        this.currentRepairRecord.set(record);
        this.loadTasks();
      }
    });
  }

  addPart(): void {
    const record = this.currentRepairRecord();
    if (!record) return;

    this.mechanicService.addPart(record.id, this.partForm).subscribe({
      next: (updatedRecord) => {
        this.currentRepairRecord.set(updatedRecord);
        this.partForm = { name: '', price: 0, quantity: 1 };
      }
    });
  }

  deletePart(partId: string): void {
    this.mechanicService.deletePart(partId).subscribe({
      next: () => {
        const record = this.currentRepairRecord();
        if (record) {
          this.mechanicService.getRepairRecord(record.appointmentId).subscribe({
            next: (updated) => this.currentRepairRecord.set(updated)
          });
        }
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'badge-blue',
      'IN_PROGRESS': 'badge-warn',
    };
    return map[status] || 'badge-blue';
  }
}