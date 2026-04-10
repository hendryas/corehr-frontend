import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DepartmentListItem } from '../../domain/models/organization.model';

@Component({
  selector: 'app-departments-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Departments</h2>
          <p class="mt-1 muted-copy">Manage the department records used by employees and other HR modules.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ departments().length }} departments
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto xl:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Department</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Description</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Updated</th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (department of departments(); track department.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ department.name }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-muted">
                  {{ department.descriptionLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <span class="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1.5 text-sm font-semibold text-brand-green">
                    {{ department.statusLabel }}
                  </span>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ department.updatedAtLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-ui-text" (click)="editDepartment.emit(department.id)">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="table-action text-danger"
                      [disabled]="deletingDepartmentId() === department.id"
                      (click)="deleteDepartment.emit(department)"
                    >
                      {{ deletingDepartmentId() === department.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-5 grid gap-4 xl:hidden">
        @for (department of departments(); track department.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-ui-text">{{ department.name }}</h3>
                <p class="mt-2 text-sm text-ui-muted">{{ department.descriptionLabel }}</p>
              </div>
              <span class="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1.5 text-sm font-semibold text-brand-green">
                {{ department.statusLabel }}
              </span>
            </div>

            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Updated</p>
            <p class="mt-1 text-sm font-medium text-ui-text">{{ department.updatedAtLabel }}</p>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-ui-text" (click)="editDepartment.emit(department.id)">
                Edit
              </button>
              <button
                type="button"
                class="table-action text-danger"
                [disabled]="deletingDepartmentId() === department.id"
                (click)="deleteDepartment.emit(department)"
              >
                {{ deletingDepartmentId() === department.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class DepartmentsTableComponent {
  readonly departments = input.required<DepartmentListItem[]>();
  readonly deletingDepartmentId = input<number | null>(null);

  readonly editDepartment = output<number>();
  readonly deleteDepartment = output<DepartmentListItem>();
}
