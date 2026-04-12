import { Routes } from '@angular/router';
import { LeaveApiService } from './data-access/leave-api.service';
import { LeaveTypeApiService } from './data-access/leave-type-api.service';
import { LeaveStore } from './state/leave.store';

export const leaveRoutes: Routes = [
  {
    path: '',
    providers: [LeaveApiService, LeaveTypeApiService, LeaveStore],
    data: {
      allowedRoles: ['admin_hr', 'employee'],
    },
    children: [
      {
        path: '',
        title: 'Leave | CoreHR',
        data: {
          eyebrow: 'Leave Hub',
          title: 'Leave',
          description: 'See leave requests, approval status, and the latest updates in one place.',
        },
        loadComponent: () =>
          import('./pages/leave-list/leave-list.component').then((m) => m.LeaveListComponent),
      },
      {
        path: 'new',
        title: 'Create Leave Request | CoreHR',
        data: {
          eyebrow: 'Leave Hub',
          title: 'Add leave request',
          description: 'Add a leave request by filling in the details below.',
        },
        loadComponent: () =>
          import('./pages/leave-create/leave-create.component').then(
            (m) => m.LeaveCreateComponent,
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Leave Request | CoreHR',
        data: {
          eyebrow: 'Leave Hub',
          title: 'Edit leave request',
          description: 'Update the dates or reason while the request is still pending.',
        },
        loadComponent: () =>
          import('./pages/leave-edit/leave-edit.component').then((m) => m.LeaveEditComponent),
      },
      {
        path: ':id',
        title: 'Leave Detail | CoreHR',
        data: {
          eyebrow: 'Leave Hub',
          title: 'Leave detail',
          description: 'See leave request details, status, and employee information.',
        },
        loadComponent: () =>
          import('./pages/leave-detail/leave-detail.component').then(
            (m) => m.LeaveDetailComponent,
          ),
      },
    ],
  },
];
