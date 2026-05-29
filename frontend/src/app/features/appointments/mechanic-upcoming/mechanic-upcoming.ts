import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService, Appointment } from '../../../core/services/appointment';

@Component({
  selector: 'app-mechanic-upcoming',
  standalone: true,
  imports: [MainLayout, DatePipe],
  templateUrl: './mechanic-upcoming.html',
  styleUrl: './mechanic-upcoming.scss'
})
export class MechanicUpcoming implements OnInit {
  today = new Date();
  loading = signal(true);
  allTasks = signal<Appointment[]>([]);

  upcomingTasks = computed(() => {
    const todayStr = this.today.toISOString().slice(0, 10);
    return this.allTasks().filter(t => t.scheduledAt.slice(0, 10) > todayStr);
  });

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const from = new Date();
    from.setDate(from.getDate() + 1);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date();
    to.setDate(to.getDate() + 14);
    to.setHours(23, 59, 59, 999);
    
    this.appointmentService.getMyTasks(from.toISOString().slice(0, 19), to.toISOString().slice(0, 19)).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
    return map[status] || 'badge-blue';
  }
}