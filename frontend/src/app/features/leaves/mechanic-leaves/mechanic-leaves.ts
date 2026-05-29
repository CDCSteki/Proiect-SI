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
  private formatToLocalDateTime(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }
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
    if (!this.leaveForm.startDate || !this.leaveForm.endDate) {
      this.leaveError.set('Please select both start and end dates.');
      return;
    }

    const start = new Date(this.leaveForm.startDate);
    const end = new Date(this.leaveForm.endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const formattedStartDate = this.formatToLocalDateTime(start);
    const formattedEndDate = this.formatToLocalDateTime(end);

    const payload = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      reason: this.leaveForm.reason
    };

    this.mechanicService.requestLeave(payload).subscribe({
      next: () => {
        this.showLeaveModal.set(false);
        this.leaveForm = { startDate: '', endDate: '', reason: '' };
        this.leaveError.set('');
        this.loadLeaves(); // reîncarcă lista
      },
      error: (err) => {
        this.leaveError.set('Error submitting request. Please try again.');
        console.error(err);
      }
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