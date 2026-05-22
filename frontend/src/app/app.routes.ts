import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/client-dashboard/client-dashboard').then(
        (m) => m.ClientDashboard,
      ),
  },
  {
    path: 'manager/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/manager-dashboard/manager-dashboard').then((m) => m.ManagerDashboard),
  },
  {
    path: 'manager/appointments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/manager-appointments/manager-appointments').then((m) => m.ManagerAppointments),
  },
  {
    path: 'manager/leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leaves/manager-leaves/manager-leaves').then((m) => m.ManagerLeaves),
  },
  {
    path: 'manager/stats',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stats/manager-stats/manager-stats').then((m) => m.ManagerStats),
  },
  {
    path: 'mechanic',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/mechanic-dashboard/mechanic-dashboard').then(
        (m) => m.MechanicDashboard,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/appointment-list/appointment-list').then(
        (m) => m.AppointmentList,
      ),
  },
  {
    path: 'appointments/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/appointment-new/appointment-new').then(
        (m) => m.AppointmentNew,
      ),
  },
  {
    path: 'cars',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cars/car-list/car-list').then((m) => m.CarList),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile-page/profile-page').then((m) => m.ProfilePage),
  },
  { path: '**', redirectTo: 'login' },
];
