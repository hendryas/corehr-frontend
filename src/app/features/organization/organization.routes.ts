import { Routes } from '@angular/router';
import { OrganizationApiService } from './data-access/organization-api.service';
import { LeaveTypeApiService } from '../leave/data-access/leave-type-api.service';
import { OrganizationStore } from './state/organization.store';

export const organizationRoutes: Routes = [
  {
    path: '',
    providers: [OrganizationApiService, LeaveTypeApiService, OrganizationStore],
    loadComponent: () =>
      import('./ui/organization-shell/organization-shell.component').then(
        (m) => m.OrganizationShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'departments',
      },
      {
        path: 'departments',
        title: 'Departments | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Departments',
          description: 'Manage department master data used across employees and other HR modules.',
        },
        loadComponent: () =>
          import('./pages/departments-list/departments-list.component').then(
            (m) => m.DepartmentsListComponent,
          ),
      },
      {
        path: 'departments/new',
        title: 'Create Department | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Add department',
          description: 'Create a new department and keep the organization structure up to date.',
        },
        loadComponent: () =>
          import('./pages/department-create/department-create.component').then(
            (m) => m.DepartmentCreateComponent,
          ),
      },
      {
        path: 'departments/:id/edit',
        title: 'Edit Department | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Edit department',
          description: 'Update department details used across the organization master data.',
        },
        loadComponent: () =>
          import('./pages/department-edit/department-edit.component').then(
            (m) => m.DepartmentEditComponent,
          ),
      },
      {
        path: 'positions',
        title: 'Positions | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Positions',
          description: 'Manage position master data and their department assignments.',
        },
        loadComponent: () =>
          import('./pages/positions-list/positions-list.component').then(
            (m) => m.PositionsListComponent,
          ),
      },
      {
        path: 'positions/new',
        title: 'Create Position | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Add position',
          description: 'Create a new position and assign it to the correct department.',
        },
        loadComponent: () =>
          import('./pages/position-create/position-create.component').then(
            (m) => m.PositionCreateComponent,
          ),
      },
      {
        path: 'positions/:id/edit',
        title: 'Edit Position | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Edit position',
          description: 'Update position details and keep department assignments aligned.',
        },
        loadComponent: () =>
          import('./pages/position-edit/position-edit.component').then(
            (m) => m.PositionEditComponent,
          ),
      },
      {
        path: 'leave-types',
        title: 'Leave Types | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Leave types',
          description: 'Manage leave type master data used by leave requests and approvals.',
        },
        loadComponent: () =>
          import('./pages/leave-types-list/leave-types-list.component').then(
            (m) => m.LeaveTypesListComponent,
          ),
      },
      {
        path: 'leave-types/new',
        title: 'Create Leave Type | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Add leave type',
          description: 'Create a new leave type and keep leave request options up to date.',
        },
        loadComponent: () =>
          import('./pages/leave-type-create/leave-type-create.component').then(
            (m) => m.LeaveTypeCreateComponent,
          ),
      },
      {
        path: 'leave-types/:id/edit',
        title: 'Edit Leave Type | CoreHR',
        data: {
          eyebrow: 'Organization',
          title: 'Edit leave type',
          description: 'Update the leave type label, code, and description used in leave requests.',
        },
        loadComponent: () =>
          import('./pages/leave-type-edit/leave-type-edit.component').then(
            (m) => m.LeaveTypeEditComponent,
          ),
      },
    ],
  },
];
