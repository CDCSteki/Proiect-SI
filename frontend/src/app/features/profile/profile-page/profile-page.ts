import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { ProfileService, UserProfile } from '../../../core/services/profile';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MainLayout, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {

  profile = signal<UserProfile | null>(null);
  loading = signal(true);
  editMode = signal(false);
  passwordMode = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  editForm = {
    firstName: '',
    lastName: '',
    phone: ''
  };

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.editForm = {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phoneNumber
        };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleEdit(): void {
    this.editMode.update(v => !v);
    this.passwordMode.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.editMode() && this.profile()) {
      this.editForm = {
        firstName: this.profile()!.firstName,
        lastName: this.profile()!.lastName,
        phone: this.profile()!.phoneNumber
      };
    }
  }

  togglePassword(): void {
    this.passwordMode.update(v => !v);
    this.editMode.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
  }

  saveProfile(): void {
    this.errorMessage.set('');

    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim()) {
      this.errorMessage.set('First and last name are required.');
      return;
    }

    this.profileService.updateProfile(this.editForm).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.editMode.set(false);
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  changePassword(): void {
    this.errorMessage.set('');

    if (!this.passwordForm.oldPassword) {
      this.errorMessage.set('Current password is required.');
      return;
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.errorMessage.set('New password must be at least 8 characters.');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.profileService.changePassword({
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.passwordMode.set(false);
        this.successMessage.set('Password changed successfully!');
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to change password.');
      }
    });
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      'CLIENT': 'Client',
      'MECHANIC': 'Mechanic',
      'MANAGER': 'Manager',
      'ADMIN': 'Administrator'
    };
    return map[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      'CLIENT': 'badge-blue',
      'MECHANIC': 'badge-green',
      'MANAGER': 'badge-warn',
      'ADMIN': 'badge-danger'
    };
    return map[role] || 'badge-gray';
  }
}