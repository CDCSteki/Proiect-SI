import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ManagerService, AvailableMechanic } from '../../../core/services/manager';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-appointments',
  standalone: true,
  imports: [MainLayout, DatePipe],
  templateUrl: './manager-appointments.html',
  styleUrl: './manager-appointments.scss'
})
export class ManagerAppointments implements OnInit, OnDestroy {
  unassigned = signal<any[]>([]);
  availableMechanics = signal<AvailableMechanic[]>([]);
  showMechanicModal = signal(false);
  selectedAppointment = signal<any>(null);

  loading = signal(true);

  private pollingSub?: Subscription;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void { 
    this.loadUnassigned(); 

    this.pollingSub = interval(15000).subscribe(() => {
      if (!this.showMechanicModal()) {
        this.refreshUnassignedSilent();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadUnassigned(): void {
    this.loading.set(true);
    this.managerService.getUnassigned().subscribe({
      next: (data) => {
        this.unassigned.set(data.filter(appt => appt.status !== 'CANCELLED'));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  refreshUnassignedSilent(): void {
    this.managerService.getUnassigned().subscribe({
      next: (data) => this.unassigned.set(data.filter(appt => appt.status !== 'CANCELLED'))
    });
  }

  openAssignModal(appointment: any): void {
    this.selectedAppointment.set(appointment);
    this.showMechanicModal.set(true);
    this.managerService.getAvailableMechanics(appointment.scheduledAt.slice(0, 19)).subscribe({
      next: (data) => this.availableMechanics.set(data)
    });
  }

  assignMechanic(mechanicId: string): void {
    const appt = this.selectedAppointment();
    if (!appt) return;
    this.managerService.assignMechanic(appt.id, mechanicId).subscribe({
      next: () => { 
        this.showMechanicModal.set(false); 
        this.loadUnassigned(); 
      }
    });
  }
}