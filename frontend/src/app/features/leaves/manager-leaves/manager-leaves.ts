import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ManagerService } from '../../../core/services/manager';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-leaves',
  standalone: true,
  imports: [MainLayout, DatePipe],
  templateUrl: './manager-leaves.html',
  styleUrl: './manager-leaves.scss'
})
export class ManagerLeaves implements OnInit, OnDestroy {
  pendingLeaves = signal<any[]>([]);
  
  private pollingSub?: Subscription;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadLeaves();

    this.pollingSub = interval(15000).subscribe(() => {
      this.refreshLeavesSilent();
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadLeaves(): void {
    this.managerService.getPendingLeaves().subscribe({
      next: (data) => this.pendingLeaves.set(data)
    });
  }

  refreshLeavesSilent(): void {
    this.managerService.getPendingLeaves().subscribe({
      next: (data) => this.pendingLeaves.set(data)
    });
  }

  approveLeave(leaveId: string, approved: boolean): void {
    this.managerService.approveLeave(leaveId, approved).subscribe({
      next: () => this.pendingLeaves.update(leaves => leaves.filter(l => l.id !== leaveId))
    });
  }
}