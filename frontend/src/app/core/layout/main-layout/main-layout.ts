import { Sidebar } from '../sidebar/sidebar';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit, OnDestroy {
  
  private roleCheckSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkRoleAndStatus();

    this.roleCheckSubscription = interval(30000).subscribe(() => {
      this.checkRoleAndStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.roleCheckSubscription) {
      this.roleCheckSubscription.unsubscribe();
    }
  }

  private checkRoleAndStatus(): void {
    const currentTokenRole = this.authService.getRole();

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (!profile.active) {
          alert('Your account has been deactivated by an admin.');
          this.authService.logout();
          return;
        }

        if (profile.role !== currentTokenRole) {
          alert(`Your role has been updated to ${profile.role}. Please log in again to access your new dashboard.`);
          this.authService.logout();
        }
      },
      error: () => {
        this.authService.logout();
      }
    });
  }
}