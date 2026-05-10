import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  loading = false;
  errorMessage = '';
  emailError = '';
  passwordError = '';
  firstNameError = '';
  lastNameError = '';
  phoneError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePasswords(): boolean {
    if (this.password !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return false;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  onRegister(): void {
    this.firstNameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';
    this.phoneError = '';

    let valid = true;

    if (!this.firstName.trim()) {
      this.firstNameError = 'First name is required.';
      valid = false;
    }
    if (!this.lastName.trim()) {
      this.lastNameError = 'Last name is required.';
      valid = false;
    }
    if (!this.phoneNumber.trim()) {
      this.phoneError = 'Phone number is required.';
      valid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(this.phoneNumber)) {
      this.phoneError = 'Please enter a valid phone number.';
      valid = false;
    }
    if (!this.validateEmail()) {
      valid = false;
    }
    if (!this.validatePasswords()) {
      valid = false;
    }

    if (!valid) return;

    this.loading = true;

    this.authService
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        },
      });
  }
}
