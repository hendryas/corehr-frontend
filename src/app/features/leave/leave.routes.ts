import { Routes } from '@angular/router';
import { LeaveApiService } from './data-access/leave-api.service';
import { LeaveStore } from './state/leave.store';

export const leaveRoutes: Routes = [
  {
    path: '',
    providers: [LeaveApiService, LeaveStore],
    children: [
      {
        path: '',
        title: 'Leave | CoreHR',
        data: {
          eyebrow: 'Leave Hub',
          title: 'Leave',
          description: 'Track leave requests, review approvals, and keep leave records up to date.',
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
          description: 'Create a new leave request and complete the required details.',
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
          description: 'Update the leave period or reason while the request is still pending.',
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
          description: 'View full leave request details, approval status, and employee information.',
        },
        loadComponent: () =>
          import('./pages/leave-detail/leave-detail.component').then(
            (m) => m.LeaveDetailComponent,
          ),
      },
    ],
  },
];
