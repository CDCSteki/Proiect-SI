import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { MechanicService } from '../../../core/services/mechanic';

@Component({
  selector: 'app-mechanic-leaves',
  standalone: true,
  imports: [MainLayout, DatePipe, FormsModule],
  templateUrl: './mechanic-leaves.html',
  styleUrl: './mechanic-leaves.scss'
})
export class MechanicLeaves implements OnInit {
  loading = signal(true);
  myLeaves = signal<any[]>([]);
  showLeaveModal = signal(false);
  leaveError = signal('');
  leaveForm = { startDate: '', endDate: '', reason: '' };

  constructor(private mechanicService: MechanicService) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.mechanicService.getMyLeaves().subscribe({
      next: (leaves) => {
        this.myLeaves.set(leaves);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submitLeaveRequest(): void {
    this.leaveError.set('');
    this.mechanicService.requestLeave(this.leaveForm).subscribe({
      next: (newLeave) => {
        this.myLeaves.update(l => [newLeave, ...l]);
        this.showLeaveModal.set(false);
        this.leaveForm = { startDate: '', endDate: '', reason: '' };
      },
      error: (err) => this.leaveError.set(err.error?.message || 'Failed to submit request.')
    });
  }

  deleteLeave(leaveId: string): void {
    this.mechanicService.deleteLeave(leaveId).subscribe({
      next: () => this.myLeaves.update(l => l.filter(leave => leave.id !== leaveId))
    });
  }

  getLeaveStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'badge-warn',
      'APPROVED': 'badge-green',
      'REJECTED': 'badge-danger'
    };
    return map[status] || 'badge-blue';
  }
}