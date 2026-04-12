import { Routes } from '@angular/router';
import { EmployeesApiService } from './data-access/employees-api.service';
import { EmployeesStore } from './state/employees.store';

export const employeeRoutes: Routes = [
  {
    path: '',
    providers: [EmployeesApiService, EmployeesStore],
    children: [
      {
        path: '',
        title: 'Employees | CoreHR',
        data: {
          eyebrow: 'Employee Directory',
          title: 'Employees',
          description: 'Find employees, check their details, and keep information up to date.',
        },
        loadComponent: () =>
          import('./pages/employee-list/employee-list.component').then((m) => m.EmployeeListComponent),
      },
      {
        path: 'new',
        title: 'Create Employee | CoreHR',
        data: {
          eyebrow: 'Employee Directory',
          title: 'Create employee',
          description: 'Add a new employee by filling in the details below.',
        },
        loadComponent: () =>
          import('./pages/employee-create/employee-create.component').then(
            (m) => m.EmployeeCreateComponent,
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Employee | CoreHR',
        data: {
          eyebrow: 'Employee Directory',
          title: 'Edit employee',
          description: 'Update employee details, role, and work information.',
        },
        loadComponent: () =>
          import('./pages/employee-edit/employee-edit.component').then((m) => m.EmployeeEditComponent),
      },
      {
        path: ':id',
        title: 'Employee Detail | CoreHR',
        data: {
          eyebrow: 'Employee Directory',
          title: 'Employee detail',
          description: 'See employee details, work information, and current status.',
        },
        loadComponent: () =>
          import('./pages/employee-detail/employee-detail.component').then(
            (m) => m.EmployeeDetailComponent,
          ),
      },
    ],
  },
];
