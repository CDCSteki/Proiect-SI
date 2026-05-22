import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AdminService, UserResponse, ChangeRoleRequest } from '../../../core/services/admin';
import { AuthService } from '../../../core/services/auth';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MainLayout, FormsModule, DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  users = signal<UserResponse[]>([]);
  loading = signal(true);
  stats = signal<any>(null);
  revenue = signal<any>(null);
  appointmentStats = signal<any>(null);

  searchQuery = signal('');
  selectedRoleFilter = signal('ALL');
  activeTab = signal<'users' | 'stats'>('users');

  showRoleModal = signal(false);
  selectedUser = signal<UserResponse | null>(null);

  roleForm: ChangeRoleRequest = {
    role: '',
    specialization: '',
    hourlyRate: undefined,
    department: '',
    accessLevel: 1
  };

  roles = ['CLIENT', 'MECHANIC', 'MANAGER', 'ADMIN'];
  roleFilters = ['ALL', 'CLIENT', 'MECHANIC', 'MANAGER', 'ADMIN'];

  filteredUsers = computed(() => {
    let result = this.users();

    if (this.selectedRoleFilter() !== 'ALL') {
      result = result.filter(u => u.role === this.selectedRoleFilter());
    }

    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    return result;
  });

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        const currentUserId = this.authService.getUserId();
        const otherUsers = data.filter(u => u.id !== currentUserId);
        
        this.users.set(otherUsers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStats(): void {
    this.adminService.getUsersCount().subscribe({
      next: (data) => this.stats.set(data)
    });

    this.adminService.getTotalRevenue().subscribe({
      next: (data) => this.revenue.set(data)
    });

    this.adminService.getAppointmentsByStatus().subscribe({
      next: (data) => this.appointmentStats.set(data)
    });
  }

  toggleActive(user: UserResponse): void {
    this.adminService.toggleActive(user.id).subscribe({
      next: (updated) => {
        this.users.update(users =>
          users.map(u => u.id === updated.id ? updated : u)
        );
      }
    });
  }

  openRoleModal(user: UserResponse): void {
    this.selectedUser.set(user);
    this.roleForm = {
      role: user.role,
      specialization: '',
      hourlyRate: undefined,
      department: '',
      accessLevel: 1
    };
    this.showRoleModal.set(true);
  }

  closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.selectedUser.set(null);
  }

  saveRole(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.adminService.changeRole(user.id, this.roleForm).subscribe({
      next: (updated) => {
        this.users.update(users =>
          users.map(u => u.id === updated.id ? updated : u)
        );
        this.closeRoleModal();
      },
      error: (err) => alert(err.error?.message || 'Failed to change role.')
    });
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      'CLIENT': 'badge-blue',
      'MECHANIC': 'badge-green',
      'MANAGER': 'badge-warn',
      'ADMIN': 'badge-danger'
    };
    return map[role] || 'badge-gray';
  }

  setTab(tab: 'users' | 'stats'): void {
    this.activeTab.set(tab);
  }

  setSearch(value: string): void {
    this.searchQuery.set(value);
  }
}