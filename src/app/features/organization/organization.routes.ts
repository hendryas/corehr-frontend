import { Routes } from '@angular/router';
import { OrganizationApiService } from './data-access/organization-api.service';
import { OrganizationStore } from './state/organization.store';

export const organizationRoutes: Routes = [
  {
    path: '',
    providers: [OrganizationApiService, OrganizationStore],
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
    ],
  },
];
