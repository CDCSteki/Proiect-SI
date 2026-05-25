import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Arata mesaj context-ual daca a fost redirectat automat
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session_expired') {
      this.infoMessage = 'Your session has expired because you logged in from another location.';
    } else if (reason === 'other_tab_login') {
      this.infoMessage = 'You have been signed out because a new login was detected in another tab.';
    }
  }

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const role = this.authService.getRole();
        switch (role) {
          case 'MANAGER': this.router.navigate(['/manager/dashboard']); break;
          case 'MECHANIC': this.router.navigate(['/mechanic/dashboard']); break;
          case 'ADMIN': this.router.navigate(['/admin']); break;
          default: this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        this.cdr.detectChanges();
      }
    });
  }
}