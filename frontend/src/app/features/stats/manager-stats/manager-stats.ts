import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ManagerService } from '../../../core/services/manager';
import { forkJoin, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-stats',
  standalone: true,
  imports: [MainLayout, CommonModule, DecimalPipe],
  templateUrl: './manager-stats.html',
  styleUrl: './manager-stats.scss'
})
export class ManagerStats implements OnInit, OnDestroy {

  statusStats = signal<any>(null);
  thisMonthRevenue = signal<number>(0);
  lastMonthRevenue = signal<number>(0);
  thisMonthCount = signal<number>(0);
  lastMonthCount = signal<number>(0);
  loading = signal(true);
  maxChartRevenue = signal<number>(0);

  revenueHistory = signal<{ month: string; amount: number; height: number }[]>([]);

  private pollingSub?: Subscription;

  revenueTrend = computed(() => this.calculateTrend(this.thisMonthRevenue(), this.lastMonthRevenue()));
  countTrend = computed(() => this.calculateTrend(this.thisMonthCount(), this.lastMonthCount()));

  completionRate = computed(() => {
    const stats = this.statusStats();
    if (!stats) return 0;
    return stats.completionRate || 0;
  });

  totalForDistribution = computed(() => {
    const stats = this.statusStats();
    if (!stats) return 1;
    const total = (stats.scheduled || 0) + (stats.inProgress || 0) + (stats.done || 0) + (stats.cancelled || 0);
    return total === 0 ? 1 : total;
  });

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.fetchData(false);

    this.pollingSub = interval(30000).subscribe(() => {
      this.fetchData(true);
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  private fetchData(isSilent: boolean): void {
    if (!isSilent) {
      this.loading.set(true);
    }

    const now = new Date();

    const m1Start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const m1End = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const m2Start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const m2End = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    const monthsData: { label: string; start: string; end: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const label = d.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase();
      monthsData.push({ label, start, end });
    }

    forkJoin({
      status: this.managerService.getAppointmentsByStatus(),
      revThis: this.managerService.getRevenue(m1Start, m1End),
      revLast: this.managerService.getRevenue(m2Start, m2End),
      countThis: this.managerService.getAppointmentsCount(m1Start, m1End),
      countLast: this.managerService.getAppointmentsCount(m2Start, m2End),
      m0: this.managerService.getRevenue(monthsData[0].start, monthsData[0].end),
      m1: this.managerService.getRevenue(monthsData[1].start, monthsData[1].end),
      m2: this.managerService.getRevenue(monthsData[2].start, monthsData[2].end),
      m3: this.managerService.getRevenue(monthsData[3].start, monthsData[3].end),
      m4: this.managerService.getRevenue(monthsData[4].start, monthsData[4].end),
      m5: this.managerService.getRevenue(monthsData[5].start, monthsData[5].end),
    }).subscribe({
      next: (res: any) => {
        this.statusStats.set(res.status);
        this.thisMonthRevenue.set(parseFloat(res.revThis.total) || 0);
        this.lastMonthRevenue.set(parseFloat(res.revLast.total) || 0);
        this.thisMonthCount.set(res.countThis.count || 0);
        this.lastMonthCount.set(res.countLast.count || 0);

        const revenues = [
          parseFloat(res.m0.total) || 0,
          parseFloat(res.m1.total) || 0,
          parseFloat(res.m2.total) || 0,
          parseFloat(res.m3.total) || 0,
          parseFloat(res.m4.total) || 0,
          parseFloat(res.m5.total) || 0
        ];

        const maxRevenue = Math.max(...revenues, 1);
        this.maxChartRevenue.set(maxRevenue);

        const history = monthsData.map((m, index) => ({
          month: m.label,
          amount: revenues[index],
          height: Math.max((revenues[index] / maxRevenue) * 100, revenues[index] > 0 ? 2 : 0)
        }));

        this.revenueHistory.set(history);
        if (!isSilent) this.loading.set(false);
      },
      error: () => {
        if (!isSilent) this.loading.set(false);
      }
    });
  }

  calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: true };
    const diff = current - previous;
    const perc = (diff / previous) * 100;
    return { value: Math.abs(perc), isPositive: perc >= 0 };
  }
}