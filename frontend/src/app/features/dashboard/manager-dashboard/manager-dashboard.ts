import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ManagerService, AvailableMechanic } from '../../../core/services/manager';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [MainLayout, DatePipe],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.scss',
})
export class ManagerDashboard implements OnInit, OnDestroy {
  appointments = signal<any[]>([]);
  loading = signal(true);
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  availableMechanics = signal<AvailableMechanic[]>([]);
  showMechanicModal = signal(false);
  selectedAppointment = signal<any>(null);

  private pollingSub?: Subscription;

  weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  });

  weekAppointments = computed(() => {
    const start = this.currentWeekStart();
    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      days.push({ date, dateStr: `${year}-${month}-${day}` });
    }
    return days;
  });

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadData();
    this.pollingSub = interval(15000).subscribe(() => {
      if (!this.showMechanicModal()) {
        this.refreshDataSilent();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadData(): void {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    this.managerService
      .getCalendar(start.toISOString().slice(0, 19), end.toISOString().slice(0, 19))
      .subscribe({
        next: (data) => {
          this.appointments.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  refreshDataSilent(): void {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    this.managerService.getCalendar(start.toISOString().slice(0, 19), end.toISOString().slice(0, 19)).subscribe({
      next: (data) => this.appointments.set(data)
    });
  }

  getAppointmentsForCell(dateStr: string, slot: string): any[] {
    return this.appointments().filter(
      (a) => a.scheduledAt.startsWith(dateStr) && a.scheduledAt.includes(`T${slot}`),
    );
  }

  getCardClass(appt: any): string {
    if (appt.status === 'CANCELLED') return 'status-cancelled';
    if (appt.status === 'DONE') return 'status-done';
    if (appt.status === 'READY_FOR_PICKUP') return 'status-done';
    if (appt.status === 'IN_PROGRESS') return 'status-inprogress';
    if (!appt.mechanicName && !appt.mechanicId) return 'status-unassigned';
    return 'status-scheduled';
  }

  openAssignModal(appointment: any): void {
    if (appointment.status === 'CANCELLED') return;

    this.selectedAppointment.set(appointment);
    this.showMechanicModal.set(true);

    if (!appointment.mechanicName && !appointment.mechanicId &&
        appointment.status !== 'DONE' && appointment.status !== 'READY_FOR_PICKUP') {
      this.managerService.getAvailableMechanics(appointment.scheduledAt.slice(0, 19)).subscribe({
        next: (data) => this.availableMechanics.set(data),
      });
    } else {
      this.availableMechanics.set([]);
    }
  }

  assignMechanic(mechanicId: string): void {
    const appt = this.selectedAppointment();
    if (!appt || appt.mechanicName || appt.mechanicId) return;

    this.managerService.assignMechanic(appt.id, mechanicId).subscribe({
      next: () => {
        this.showMechanicModal.set(false);
        this.loadData();
      },
    });
  }

  prevWeek(): void {
    this.currentWeekStart.update((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 7);
      return n;
    });
    this.loadData();
  }

  nextWeek(): void {
    this.currentWeekStart.update((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 7);
      return n;
    });
    this.loadData();
  }

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}