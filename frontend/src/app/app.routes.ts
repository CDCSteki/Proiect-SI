import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

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
    canActivate: [authGuard, roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./features/dashboard/client-dashboard/client-dashboard').then(
        (m) => m.ClientDashboard,
      ),
  },
  {
    path: 'manager/dashboard',
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
    loadComponent: () => import('./features/dashboard/manager-dashboard/manager-dashboard').then((m) => m.ManagerDashboard),
  },
  {
    path: 'manager/appointments',
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
    loadComponent: () => import('./features/appointments/manager-appointments/manager-appointments').then((m) => m.ManagerAppointments),
  },
  {
    path: 'manager/leaves',
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
    loadComponent: () => import('./features/leaves/manager-leaves/manager-leaves').then((m) => m.ManagerLeaves),
  },
  {
    path: 'manager/stats',
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
    loadComponent: () => import('./features/stats/manager-stats/manager-stats').then((m) => m.ManagerStats),
  },
  {
    path: 'manager/invoices',
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
    loadComponent: () => import('./features/invoices/manager-invoices/manager-invoices').then((m) => m.ManagerInvoices),
  },
  {
    path: 'mechanic/dashboard',
    canActivate: [authGuard, roleGuard(['MECHANIC'])],
    loadComponent: () => import('./features/dashboard/mechanic-dashboard/mechanic-dashboard').then((m) => m.MechanicDashboard),
  },
  {
    path: 'mechanic/upcoming',
    canActivate: [authGuard, roleGuard(['MECHANIC'])],
    loadComponent: () => import('./features/appointments/mechanic-upcoming/mechanic-upcoming').then((m) => m.MechanicUpcoming),
  },
  {
    path: 'mechanic/leaves',
    canActivate: [authGuard, roleGuard(['MECHANIC'])],
    loadComponent: () => import('./features/leaves/mechanic-leaves/mechanic-leaves').then((m) => m.MechanicLeaves),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/dashboard/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'appointments',
    canActivate: [authGuard, roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./features/appointments/appointment-list/appointment-list').then(
        (m) => m.AppointmentList,
      ),
  },
  {
    path: 'appointments/new',
    canActivate: [authGuard, roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./features/appointments/appointment-new/appointment-new').then(
        (m) => m.AppointmentNew,
      ),
  },
  {
    path: 'cars',
    canActivate: [authGuard, roleGuard(['CLIENT'])],
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