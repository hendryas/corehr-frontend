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
          description: 'See and manage the department list used across CoreHR.',
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
          description: 'Add a department so it can be used in employee records.',
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
          description: 'Update department details and keep the list up to date.',
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
          description: 'See and manage the position list used across CoreHR.',
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
          description: 'Add a position and link it to the right department.',
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
          description: 'Update position details and department information.',
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
          description: 'See and manage the leave options used in leave requests.',
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
          description: 'Add a leave type so it can be used in leave requests.',
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
          description: 'Update the leave type name, code, and description.',
        },
        loadComponent: () =>
          import('./pages/leave-type-edit/leave-type-edit.component').then(
            (m) => m.LeaveTypeEditComponent,
          ),
      },
    ],
  },
];
