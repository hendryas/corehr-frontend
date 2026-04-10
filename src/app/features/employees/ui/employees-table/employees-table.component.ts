import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pagination } from 'flowbite-angular/pagination';
import {
  EmployeeListItem,
  EmployeesPagination,
} from '../../domain/models/employee.model';
import { EmployeeStatusBadgeComponent } from '../employee-status-badge/employee-status-badge.component';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [Pagination, EmployeeStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Employee list</h2>
          <p class="mt-1 muted-copy">View and manage employee information from one page.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ pagination().total }} total employees
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto lg:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Code
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Employee
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Department
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Position
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Hire date
              </th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-b-0">
            @for (employee of employees(); track employee.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ employee.employeeCode }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <div>
                    <p class="font-semibold text-ui-text">{{ employee.fullName }}</p>
                    <p class="mt-1 text-sm text-ui-muted">{{ employee.email }}</p>
                  </div>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ employee.departmentName }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ employee.positionName }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <app-employee-status-badge [isActive]="employee.isActive" />
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ employee.hireDateLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-brand-blue" (click)="viewEmployee.emit(employee.id)">
                      View detail
                    </button>
                    <button type="button" class="table-action text-ui-text" (click)="editEmployee.emit(employee.id)">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="table-action text-danger"
                      [disabled]="deletingEmployeeId() === employee.id"
                      (click)="deleteEmployee.emit(employee)"
                    >
                      {{ deletingEmployeeId() === employee.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-5 grid gap-4 lg:hidden">
        @for (employee of employees(); track employee.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">{{ employee.employeeCode }}</p>
                <h3 class="mt-2 text-lg font-bold text-ui-text">{{ employee.fullName }}</h3>
                <p class="mt-1 text-sm text-ui-muted">{{ employee.email }}</p>
              </div>
              <app-employee-status-badge [isActive]="employee.isActive" />
            </div>

            <dl class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Department</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ employee.departmentName }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Position</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ employee.positionName }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Hire date</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ employee.hireDateLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Role</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ employee.roleLabel }}</dd>
              </div>
            </dl>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-brand-blue" (click)="viewEmployee.emit(employee.id)">
                View detail
              </button>
              <button type="button" class="table-action text-ui-text" (click)="editEmployee.emit(employee.id)">
                Edit
              </button>
              <button
                type="button"
                class="table-action text-danger"
                [disabled]="deletingEmployeeId() === employee.id"
                (click)="deleteEmployee.emit(employee)"
              >
                {{ deletingEmployeeId() === employee.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </article>
        }
      </div>

      @if (pagination().totalPages > 1) {
        <div class="mt-6 flex justify-end">
          <nav
            flowbitePagination
            color="primary"
            [page]="pagination().page"
            [pageCount]="pagination().totalPages"
            [tabs]="5"
            (pageChange)="pageChange.emit($event)"
          ></nav>
        </div>
      }
    </section>
  `,
})
export class EmployeesTableComponent {
  readonly employees = input.required<EmployeeListItem[]>();
  readonly pagination = input.required<EmployeesPagination>();
  readonly deletingEmployeeId = input<number | null>(null);

  readonly viewEmployee = output<number>();
  readonly editEmployee = output<number>();
  readonly deleteEmployee = output<EmployeeListItem>();
  readonly pageChange = output<number>();
}
