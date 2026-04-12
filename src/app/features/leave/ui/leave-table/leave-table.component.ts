import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pagination } from 'flowbite-angular/pagination';
import {
  LeaveActionType,
  LeaveListItem,
  LeavePagination,
} from '../../domain/models/leave.model';
import { LeaveStatusBadgeComponent } from '../leave-status-badge/leave-status-badge.component';

@Component({
  selector: 'app-leave-table',
  standalone: true,
  imports: [Pagination, LeaveStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Leave requests</h2>
          <p class="mt-1 muted-copy">See leave requests and take action in one place.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ pagination().total }} total requests
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto xl:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Request date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Employee
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Leave type
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Leave period
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Total days
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Reason
              </th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (leave of leaves(); track leave.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ leave.requestDateLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <div>
                    <p class="font-semibold text-ui-text">{{ leave.fullName }}</p>
                    <p class="mt-1 text-sm text-ui-muted">{{ leave.departmentName }}</p>
                  </div>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ leave.leaveTypeName }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  <div>
                    <p>{{ leave.startDateLabel }}</p>
                    <p class="mt-1 text-xs text-ui-muted">to {{ leave.endDateLabel }}</p>
                  </div>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ leave.totalDaysLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <app-leave-status-badge [status]="leave.status" />
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-muted">
                  {{ leave.reasonLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-brand-blue" (click)="viewLeave.emit(leave.id)">
                      View
                    </button>
                    @if (canEdit(leave)) {
                      <button type="button" class="table-action text-ui-text" (click)="editLeave.emit(leave.id)">
                        Edit
                      </button>
                    }
                    @if (canApproveReject() && leave.status === 'pending') {
                      <button
                        type="button"
                        class="table-action text-brand-green"
                        [disabled]="isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject') || isProcessing(leave.id, 'delete')"
                        (click)="approveLeave.emit(leave)"
                      >
                        {{ isProcessing(leave.id, 'approve') ? 'Approving...' : 'Approve' }}
                      </button>
                      <button
                        type="button"
                        class="table-action text-warning"
                        [disabled]="isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject') || isProcessing(leave.id, 'delete')"
                        (click)="rejectLeave.emit(leave)"
                      >
                        {{ isProcessing(leave.id, 'reject') ? 'Rejecting...' : 'Reject' }}
                      </button>
                    }
                    @if (canDelete(leave)) {
                      <button
                        type="button"
                        class="table-action text-danger"
                        [disabled]="isProcessing(leave.id, 'delete') || isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject')"
                        (click)="deleteLeave.emit(leave)"
                      >
                        {{ isProcessing(leave.id, 'delete') ? 'Removing...' : deleteLabel() }}
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
        @for (leave of leaves(); track leave.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">{{ leave.requestDateLabel }}</p>
                <h3 class="mt-2 text-lg font-bold text-ui-text">{{ leave.fullName }}</h3>
                <p class="mt-1 text-sm text-ui-muted">{{ leave.departmentName }}</p>
              </div>
              <app-leave-status-badge [status]="leave.status" />
            </div>

            <dl class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Leave type</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ leave.leaveTypeName }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Total days</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ leave.totalDaysLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Start date</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ leave.startDateLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">End date</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ leave.endDateLabel }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Reason</dt>
                <dd class="mt-1 text-sm font-medium text-ui-text">{{ leave.reasonLabel }}</dd>
              </div>
            </dl>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-brand-blue" (click)="viewLeave.emit(leave.id)">
                View
              </button>
              @if (canEdit(leave)) {
                <button type="button" class="table-action text-ui-text" (click)="editLeave.emit(leave.id)">
                  Edit
                </button>
              }
              @if (canApproveReject() && leave.status === 'pending') {
                <button
                  type="button"
                  class="table-action text-brand-green"
                  [disabled]="isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject') || isProcessing(leave.id, 'delete')"
                  (click)="approveLeave.emit(leave)"
                >
                  {{ isProcessing(leave.id, 'approve') ? 'Approving...' : 'Approve' }}
                </button>
                <button
                  type="button"
                  class="table-action text-warning"
                  [disabled]="isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject') || isProcessing(leave.id, 'delete')"
                  (click)="rejectLeave.emit(leave)"
                >
                  {{ isProcessing(leave.id, 'reject') ? 'Rejecting...' : 'Reject' }}
                </button>
              }
              @if (canDelete(leave)) {
                <button
                  type="button"
                  class="table-action text-danger"
                  [disabled]="isProcessing(leave.id, 'delete') || isProcessing(leave.id, 'approve') || isProcessing(leave.id, 'reject')"
                  (click)="deleteLeave.emit(leave)"
                >
                  {{ isProcessing(leave.id, 'delete') ? 'Removing...' : deleteLabel() }}
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
export class LeaveTableComponent {
  readonly leaves = input.required<LeaveListItem[]>();
  readonly pagination = input.required<LeavePagination>();
  readonly processingLeaveId = input<number | null>(null);
  readonly processingAction = input<LeaveActionType>(null);
  readonly isAdmin = input(false);
  readonly canApproveReject = input(false);

  readonly viewLeave = output<number>();
  readonly editLeave = output<number>();
  readonly approveLeave = output<LeaveListItem>();
  readonly rejectLeave = output<LeaveListItem>();
  readonly deleteLeave = output<LeaveListItem>();
  readonly pageChange = output<number>();

  protected canEdit(leave: LeaveListItem): boolean {
    return leave.status === 'pending';
  }

  protected canDelete(leave: LeaveListItem): boolean {
    return leave.status === 'pending';
  }

  protected deleteLabel(): string {
    return this.isAdmin() ? 'Delete' : 'Cancel request';
  }

  protected isProcessing(
    leaveId: number,
    action: Exclude<LeaveActionType, null>,
  ): boolean {
    return this.processingLeaveId() === leaveId && this.processingAction() === action;
  }
}
