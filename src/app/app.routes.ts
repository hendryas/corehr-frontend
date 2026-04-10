import { Routes } from '@angular/router';
import { authChildGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        title: 'Login | CoreHR',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | CoreHR',
        data: {
          eyebrow: 'CoreHR CMS',
          title: 'Dashboard overview',
          description:
            'Get a clean operational snapshot before deeper HR modules are connected to the backend.',
        },
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.employeeRoutes),
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./features/attendance/attendance.routes').then((m) => m.attendanceRoutes),
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.routes').then((m) => m.leaveRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
