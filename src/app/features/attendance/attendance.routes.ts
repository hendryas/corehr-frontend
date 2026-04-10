import { Routes } from '@angular/router';
import { AttendanceApiService } from './data-access/attendance-api.service';
import { AttendanceStore } from './state/attendance.store';

export const attendanceRoutes: Routes = [
  {
    path: '',
    providers: [AttendanceApiService, AttendanceStore],
    children: [
      {
        path: '',
        title: 'Attendance | CoreHR',
        data: {
          eyebrow: 'Attendance Hub',
          title: 'Attendance',
          description: 'Review daily attendance activity and keep employee attendance records up to date.',
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
          eyebrow: 'Attendance Hub',
          title: 'Add attendance',
          description: 'Create a new attendance record and complete the attendance details.',
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
          eyebrow: 'Attendance Hub',
          title: 'Edit attendance',
          description: 'Update attendance timing, status, and notes for an existing record.',
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
          description: 'View the full attendance record, employee information, and attendance status.',
        },
        loadComponent: () =>
          import('./pages/attendance-detail/attendance-detail.component').then(
            (m) => m.AttendanceDetailComponent,
          ),
      },
    ],
  },
];
