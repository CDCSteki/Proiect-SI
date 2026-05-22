import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  navItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.navItems = this.getNavItems(role);
  }

  getNavItems(role: string | null): NavItem[] {
    const common = [
      { path: '/profile', label: 'Profile', icon: '👤' }
    ];

    switch (role) {
      case 'CLIENT':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/appointments', label: 'Appointments', icon: '📅' },
          { path: '/appointments/new', label: 'New Appointment', icon: '➕' },
          { path: '/cars', label: 'My Cars', icon: '🚗' },
          ...common
        ];
      case 'MECHANIC':
        return [
          { path: '/mechanic', label: 'Dashboard', icon: '🏠' },
          { path: '/appointments', label: 'My Tasks', icon: '🔧' },
          ...common
        ];
      case 'MANAGER':
        return [
          { path: '/manager', label: 'Dashboard', icon: '🏠' },
          { path: '/appointments', label: 'Calendar', icon: '📅' },
          ...common
        ];
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Dashboard', icon: '🏠' },
          ...common
        ];
      default:
        return common;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
} 