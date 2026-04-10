import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pagination } from 'flowbite-angular/pagination';
import {
  AttendanceListItem,
  AttendancePagination,
} from '../../domain/models/attendance.model';
import { AttendanceStatusBadgeComponent } from '../attendance-status-badge/attendance-status-badge.component';

@Component({
  selector: 'app-attendance-table',
  standalone: true,
  imports: [Pagination, AttendanceStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Attendance history</h2>
          <p class="mt-1 muted-copy">Review daily attendance records and follow up on employee attendance activity.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ pagination().total }} total records
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto xl:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Employee
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Department
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Check in
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Check out
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Notes
              </th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (attendance of attendances(); track attendance.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ attendance.attendanceDateLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <div>
                    <p class="font-semibold text-ui-text">{{ attendance.fullName }}</p>
                    <p class="mt-1 text-sm text-ui-muted">{{ attendance.employeeCode }}</p>
                  </div>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  <div>
                    <p>{{ attendance.departmentName }}</p>
                    <p class="mt-1 text-xs text-ui-muted">{{ attendance.positionName }}</p>
                  </div>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ attendance.checkInLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ attendance.checkOutLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <app-attendance-status-badge [status]="attendance.status" />
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-muted">
                  {{ attendance.notesLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-brand-blue" (click)="viewAttendance.emit(attendance.id)">
                      View detail
                    </button>
                    @if (canManage()) {
                      <button type="button" class="table-action text-ui-text" (click)="editAttendance.emit(attendance.id)">
                        Edit
                      </button>
                      <button
                        type="button"
                        class="table-action text-danger"
                        [disabled]="deletingAttendanceId() === attendance.id"
                        (click)="deleteAttendance.emit(attendance)"
                      >
                        {{ deletingAttendanceId() === attendance.id ? 'Deleting...' : 'Delete' }}
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-5 grid gap-4 xl:hidden">
        @for (attendance of attendances(); track attendance.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">{{ attendance.attendanceDateLabel }}</p>
                <h3 class="mt-2 text-lg font-bold text-ui-text">{{ attendance.fullName }}</h3>
                <p class="mt-1 text-sm text-ui-muted">{{ attendance.employeeCode }}</p>
              </div>
              <app-attendance-status-badge [status]="attendance.status" />
            </div>

            <dl class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Department</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ attendance.departmentName }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Position</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ attendance.positionName }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Check in</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ attendance.checkInLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Check out</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ attendance.checkOutLabel }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Notes</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ attendance.notesLabel }}</dd>
              </div>
            </dl>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-brand-blue" (click)="viewAttendance.emit(attendance.id)">
                View detail
              </button>
              @if (canManage()) {
                <button type="button" class="table-action text-ui-text" (click)="editAttendance.emit(attendance.id)">
                  Edit
                </button>
                <button
                  type="button"
                  class="table-action text-danger"
                  [disabled]="deletingAttendanceId() === attendance.id"
                  (click)="deleteAttendance.emit(attendance)"
                >
                  {{ deletingAttendanceId() === attendance.id ? 'Deleting...' : 'Delete' }}
                </button>
              }
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
export class AttendanceTableComponent {
  readonly attendances = input.required<AttendanceListItem[]>();
  readonly pagination = input.required<AttendancePagination>();
  readonly deletingAttendanceId = input<number | null>(null);
  readonly canManage = input(false);

  readonly viewAttendance = output<number>();
  readonly editAttendance = output<number>();
  readonly deleteAttendance = output<AttendanceListItem>();
  readonly pageChange = output<number>();
}
