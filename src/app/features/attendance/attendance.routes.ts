import { Routes } from '@angular/router';
import { AttendanceApiService } from './data-access/attendance-api.service';
import { AttendanceStore } from './state/attendance.store';

export const attendanceRoutes: Routes = [
  {
    path: '',
    providers: [AttendanceApiService, AttendanceStore],
    data: {
      allowedRoles: ['admin_hr', 'employee'],
    },
    children: [
      {
        path: '',
        title: 'Attendance | CoreHR',
        data: {
          eyebrow: 'Attendance Hub',
          title: 'Attendance',
          description: 'Check daily attendance and see the latest employee attendance updates.',
        },
        loadComponent: () =>
          import('./pages/attendance-list/attendance-list.component').then(
            (m) => m.AttendanceListComponent,
          ),
      },
      {
        path: 'new',
        title: 'Add Attendance | CoreHR',
        data: {
          allowedRoles: ['admin_hr'],
          eyebrow: 'Attendance Hub',
          title: 'Add attendance',
          description: 'Add an attendance entry by filling in the details below.',
        },
        loadComponent: () =>
          import('./pages/attendance-create/attendance-create.component').then(
            (m) => m.AttendanceCreateComponent,
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Attendance | CoreHR',
        data: {
          allowedRoles: ['admin_hr'],
          eyebrow: 'Attendance Hub',
          title: 'Edit attendance',
          description: 'Update the attendance status, time, or note if needed.',
        },
        loadComponent: () =>
          import('./pages/attendance-edit/attendance-edit.component').then(
            (m) => m.AttendanceEditComponent,
          ),
      },
      {
        path: ':id',
        title: 'Attendance Detail | CoreHR',
        data: {
          eyebrow: 'Attendance Hub',
          title: 'Attendance detail',
          description: 'See attendance details, employee information, and status.',
        },
        loadComponent: () =>
          import('./pages/attendance-detail/attendance-detail.component').then(
            (m) => m.AttendanceDetailComponent,
          ),
      },
    ],
  },
];
