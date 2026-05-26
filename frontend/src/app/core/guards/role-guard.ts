import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = localStorage.getItem('token');
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    const role = authService.getRole();
    if (!role || !allowedRoles.includes(role)) {
      // Redirectează la dashboard-ul corespunzător rolului
      switch (role) {
        case 'MANAGER': router.navigate(['/manager/dashboard']); break;
        case 'MECHANIC': router.navigate(['/mechanic/dashboard']); break;
        case 'ADMIN': router.navigate(['/admin']); break;
        default: router.navigate(['/dashboard']);
      }
      return false;
    }

    return true;
  };
};