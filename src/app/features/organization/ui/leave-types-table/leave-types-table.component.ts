import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LeaveTypeListItem } from '../../../leave/domain/models/leave-type.model';

@Component({
  selector: 'app-leave-types-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Leave types</h2>
          <p class="mt-1 muted-copy">See the leave options used in leave requests.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ leaveTypes().length }} leave types
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto xl:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Code</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Description</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Updated</th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (leaveType of leaveTypes(); track leaveType.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ leaveType.code }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ leaveType.name }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-muted">
                  {{ leaveType.descriptionLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ leaveType.statusLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ leaveType.updatedAtLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-ui-text" (click)="editLeaveType.emit(leaveType.id)">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="table-action text-danger"
                      [disabled]="deletingLeaveTypeId() === leaveType.id"
                      (click)="deleteLeaveType.emit(leaveType)"
                    >
                      {{ deletingLeaveTypeId() === leaveType.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-5 grid gap-4 xl:hidden">
        @for (leaveType of leaveTypes(); track leaveType.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">{{ leaveType.code }}</p>
                <h3 class="mt-2 text-lg font-bold text-ui-text">{{ leaveType.name }}</h3>
                <p class="mt-2 text-sm text-ui-muted">{{ leaveType.descriptionLabel }}</p>
              </div>
              <span class="rounded-full border border-ui-border bg-ui-surface px-3 py-1.5 text-xs font-semibold text-ui-text">
                {{ leaveType.statusLabel }}
              </span>
            </div>

            <div class="mt-4 text-sm text-ui-muted">
              Last updated {{ leaveType.updatedAtLabel }}
            </div>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-ui-text" (click)="editLeaveType.emit(leaveType.id)">
                Edit
              </button>
              <button
                type="button"
                class="table-action text-danger"
                [disabled]="deletingLeaveTypeId() === leaveType.id"
                (click)="deleteLeaveType.emit(leaveType)"
              >
                {{ deletingLeaveTypeId() === leaveType.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class LeaveTypesTableComponent {
  readonly leaveTypes = input.required<LeaveTypeListItem[]>();
  readonly deletingLeaveTypeId = input<number | null>(null);

  readonly editLeaveType = output<number>();
  readonly deleteLeaveType = output<LeaveTypeListItem>();
}
