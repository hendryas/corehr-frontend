import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from 'flowbite-angular/modal';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import {
  LeaveActionType,
  LeaveListItem,
  LeaveRequestStatusFilter,
} from '../../domain/models/leave.model';
import { LeaveStore } from '../../state/leave.store';
import { LeaveTableComponent } from '../../ui/leave-table/leave-table.component';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgpDialogTrigger,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    AppIconComponent,
    LeaveTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.actionSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Request updated</p>
                <p class="mt-1 text-sm text-ui-muted">{{ store.actionSuccessMessage() }}</p>
              </div>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-sm font-semibold text-ui-muted transition hover:bg-slate-100 hover:text-ui-text"
                (click)="store.clearActionSuccessMessage()"
              >
                x
              </button>
            </div>
          </div>
        </div>
      }

      @if (navigationError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ navigationError() }}</p>
            <button type="button" class="btn-secondary" (click)="navigationError.set(null)">Dismiss</button>
          </div>
        </div>
      }

      @if (store.exportError()) {
        <div class="rounded-[24px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-warning">{{ store.exportError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearExportError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.leaveTypesError()) {
        <div class="rounded-[24px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-ui-text">Leave type filter is temporarily unavailable</p>
              <p class="mt-1 text-sm text-ui-muted">{{ store.leaveTypesError() }}</p>
            </div>
            <button type="button" class="btn-secondary" (click)="reloadLeaveTypes()">Retry</button>
          </div>
        </div>
      }

      @if (store.summaryError()) {
        <div class="rounded-[24px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-ui-text">Leave summary is partially unavailable</p>
              <p class="mt-1 text-sm text-ui-muted">{{ store.summaryError() }}</p>
            </div>
            <button type="button" class="btn-secondary" (click)="reloadSummary()">Retry</button>
          </div>
        </div>
      }

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (card of summaryCards(); track card.label) {
          <article class="surface-card relative overflow-hidden p-5 sm:p-6">
            <div class="absolute inset-x-0 top-0 h-1.5" [class]="card.barClass"></div>
            <div class="space-y-4">
              <p class="text-sm font-medium text-ui-muted">{{ card.label }}</p>
              <div>
                <h2 class="text-3xl font-bold text-ui-text">{{ card.value }}</h2>
                <p class="mt-2 text-sm font-semibold" [class]="card.deltaClass">{{ card.delta }}</p>
              </div>
            </div>
          </article>
        }
      </div>

      <div class="surface-card p-6">
        <div class="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_220px_220px_190px_190px_auto_auto] 2xl:items-end">
          <label class="space-y-2">
            <span class="field-label">Search requests</span>
            <span class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-ui-muted">
                <app-icon name="search" iconClass="h-4 w-4" />
              </span>
              <input
                type="search"
                class="field-shell pl-11"
                [formControl]="searchControl"
                placeholder="Search employee name"
              />
            </span>
          </label>

          <label class="space-y-2">
            <span class="field-label">Status</span>
            <select class="field-shell" [value]="store.filters().status" (change)="onStatusChange($any($event.target).value)">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="field-label">Leave type</span>
            <select
              class="field-shell"
              [value]="selectedLeaveTypeValue()"
              [disabled]="store.isLeaveTypesLoading() || !!store.leaveTypesError()"
              (change)="onLeaveTypeChange($event)"
            >
              <option value="">All leave types</option>
              @for (leaveType of store.leaveTypes(); track leaveType.id) {
                <option [value]="leaveType.id">{{ leaveType.name }}</option>
              }
            </select>
          </label>

          <label class="space-y-2">
            <span class="field-label">Start date</span>
            <input
              type="date"
              class="field-shell"
              [value]="store.filters().startDate"
              (change)="onStartDateChange($any($event.target).value)"
            />
          </label>

          <label class="space-y-2">
            <span class="field-label">End date</span>
            <input
              type="date"
              class="field-shell"
              [value]="store.filters().endDate"
              (change)="onEndDateChange($any($event.target).value)"
            />
          </label>

          @if (store.isAdmin()) {
            <button
              type="button"
              class="btn-secondary justify-center 2xl:min-w-44"
              [disabled]="store.isExportingCsv()"
              (click)="exportCsv()"
            >
              <app-icon name="download" iconClass="h-4 w-4" />
              {{ store.isExportingCsv() ? 'Exporting...' : 'Export CSV' }}
            </button>
          }

          <button type="button" class="btn-primary justify-center 2xl:min-w-44" (click)="openCreate()">
            Add leave request
          </button>
        </div>
      </div>

      <button
        #actionDialogLauncher
        type="button"
        class="hidden"
        [ngpDialogTrigger]="actionDialog"
        (ngpDialogTriggerClosed)="resetActionState()"
      ></button>

      @if (store.actionError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.actionError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearActionError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.listError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Leave requests are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.listError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isListLoading() && !store.hasLeaves()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 w-56 rounded-full bg-slate-200"></div>
            @for (placeholder of placeholderRows; track placeholder) {
              <div class="h-18 rounded-[24px] bg-slate-100"></div>
            }
          </div>
        </section>
      } @else if (store.isEmpty()) {
        <div class="state-panel">
          <div>
            <p class="text-base font-semibold text-ui-text">No leave requests found</p>
            <p class="mt-2 text-sm text-ui-muted">
              Adjust the filters or create a new leave request to continue.
            </p>
          </div>
          <button type="button" class="btn-primary" (click)="openCreate()">Add leave request</button>
        </div>
      } @else {
        <app-leave-table
          [leaves]="store.filteredLeaves()"
          [pagination]="store.pagination()"
          [processingLeaveId]="store.processingLeaveId()"
          [processingAction]="store.processingAction()"
          [isAdmin]="store.isAdmin()"
          [canApproveReject]="store.isAdmin()"
          (viewLeave)="openDetail($event)"
          (editLeave)="openEdit($event)"
          (approveLeave)="openApproveDialog($event)"
          (rejectLeave)="openRejectDialog($event)"
          (deleteLeave)="openDeleteDialog($event)"
          (pageChange)="changePage($event)"
        />
      }

      <ng-template #actionDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">{{ dialogTitle() }}</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">{{ dialogDescription() }}</p>
              <div class="rounded-[22px] border border-ui-border bg-ui-bg/70 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingLeave()?.fullName }}</p>
                <p class="mt-1 text-sm text-ui-muted">
                  {{ pendingLeave()?.leaveTypeName }} · {{ pendingLeave()?.startDateLabel }} to {{ pendingLeave()?.endDateLabel }}
                </p>
              </div>

              @if (dialogAction() === 'reject') {
                <div class="space-y-2">
                  <label class="field-label" for="rejectionReason">Rejection note</label>
                  <textarea
                    id="rejectionReason"
                    rows="4"
                    class="field-shell min-h-28 resize-y"
                    [formControl]="rejectionReasonControl"
                    placeholder="Add the reason for rejecting this request"
                  ></textarea>
                  @if (rejectionReasonControl.touched && rejectionReasonControl.invalid) {
                    <p class="field-error">Rejection note is required.</p>
                  }
                </div>
              }
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button
                type="button"
                class="btn-secondary"
                [disabled]="store.processingLeaveId() !== null"
                (click)="close()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary"
                [class.!bg-brand-green]="dialogAction() === 'approve'"
                [class.hover:!bg-brand-greenDark]="dialogAction() === 'approve'"
                [class.!bg-danger]="dialogAction() === 'delete'"
                [class.hover:!bg-red-700]="dialogAction() === 'delete'"
                [class.!bg-warning]="dialogAction() === 'reject'"
                [class.hover:!bg-amber-600]="dialogAction() === 'reject'"
                [disabled]="store.processingLeaveId() !== null"
                (click)="confirmAction(close)"
              >
                {{ confirmLabel() }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class LeaveListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(LeaveStore);
  private readonly actionDialogLauncher =
    viewChild.required<ElementRef<HTMLButtonElement>>('actionDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingLeave = signal<LeaveListItem | null>(null);
  protected readonly dialogAction = signal<LeaveActionType>(null);
  protected readonly navigationError = signal<string | null>(null);
  protected readonly rejectionReasonControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly searchControl = new FormControl(this.store.filters().search, {
    nonNullable: true,
  });

  protected readonly summaryCards = computed(() => {
    const summary = this.store.summary();
    const isLoading = this.store.isSummaryLoading();

    return [
      {
        label: 'Total requests',
        value: this.store.isListLoading() ? '...' : String(summary.totalRequests),
        delta: 'Across the current leave request list',
        barClass: 'bg-brand-blue',
        deltaClass: 'text-brand-blue',
      },
      {
        label: 'Pending requests',
        value: isLoading ? '...' : String(summary.pendingRequests),
        delta: 'Waiting for review',
        barClass: 'bg-brand-gold',
        deltaClass: 'text-brand-gold',
      },
      {
        label: 'Approved requests',
        value: isLoading ? '...' : String(summary.approvedRequests),
        delta: 'Approved by HR',
        barClass: 'bg-brand-green',
        deltaClass: 'text-brand-green',
      },
      {
        label: 'Rejected requests',
        value: isLoading ? '...' : String(summary.rejectedRequests),
        delta: 'Rejected after review',
        barClass: 'bg-danger',
        deltaClass: 'text-danger',
      },
    ];
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updateSearch(value);
        void this.store.loadLeaves();
      });

    void Promise.allSettled([
      this.store.loadLeaveTypes(),
      this.store.loadLeaves(),
      this.store.loadSummary(),
    ]);
  }

  protected selectedLeaveTypeValue(): string {
    return this.store.filters().leaveTypeId ? String(this.store.filters().leaveTypeId) : '';
  }

  protected onStatusChange(value: LeaveRequestStatusFilter): void {
    this.navigationError.set(null);
    this.store.updateStatus(value);
    void this.store.loadLeaves();
  }

  protected onStartDateChange(value: string): void {
    this.navigationError.set(null);
    this.store.updateStartDate(value);
    void this.store.loadLeaves();
  }

  protected onLeaveTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.updateLeaveType(value ? Number(value) : null);
    void this.store.loadLeaves();
  }

  protected onEndDateChange(value: string): void {
    this.navigationError.set(null);
    this.store.updateEndDate(value);
    void this.store.loadLeaves();
  }

  protected changePage(page: number): void {
    this.store.updatePage(page);
    void this.store.loadLeaves();
  }

  protected openDetail(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/leave', id]);
  }

  protected openEdit(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/leave', id, 'edit']);
  }

  protected async openCreate(): Promise<void> {
    this.navigationError.set(null);

    try {
      const navigated = await this.router.navigate(['/leave', 'new']);

      if (!navigated) {
        this.navigationError.set('The add leave request page could not be opened. Please try again.');
      }
    } catch {
      this.navigationError.set('The add leave request page could not be opened. Please try again.');
    }
  }

  protected openApproveDialog(leave: LeaveListItem): void {
    this.openActionDialog(leave, 'approve');
  }

  protected openRejectDialog(leave: LeaveListItem): void {
    this.openActionDialog(leave, 'reject');
  }

  protected openDeleteDialog(leave: LeaveListItem): void {
    this.openActionDialog(leave, 'delete');
  }

  protected resetActionState(): void {
    this.pendingLeave.set(null);
    this.dialogAction.set(null);
    this.rejectionReasonControl.reset('');
  }

  protected async confirmAction(close: () => void): Promise<void> {
    const leave = this.pendingLeave();
    const action = this.dialogAction();

    if (!leave || !action) {
      return;
    }

    if (action === 'reject') {
      if (this.rejectionReasonControl.invalid) {
        this.rejectionReasonControl.markAsTouched();
        return;
      }

      const rejected = await this.store.rejectLeave(leave.id, this.rejectionReasonControl.value);

      if (rejected) {
        close();
      }

      return;
    }

    const succeeded =
      action === 'approve'
        ? await this.store.approveLeave(leave.id)
        : await this.store.deleteLeave(leave.id);

    if (succeeded) {
      close();
    }
  }

  protected dialogTitle(): string {
    switch (this.dialogAction()) {
      case 'approve':
        return 'Approve leave request';
      case 'reject':
        return 'Reject leave request';
      case 'delete':
        return this.store.isAdmin() ? 'Delete leave request' : 'Cancel leave request';
      default:
        return 'Confirm action';
    }
  }

  protected dialogDescription(): string {
    switch (this.dialogAction()) {
      case 'approve':
        return 'Approve this leave request and update its status.';
      case 'reject':
        return 'Reject this leave request and add a short reason for the employee.';
      case 'delete':
        return this.store.isAdmin()
          ? 'This will remove the leave request from the active list.'
          : 'This will cancel your pending leave request.';
      default:
        return 'Please confirm this action.';
    }
  }

  protected confirmLabel(): string {
    const leaveId = this.pendingLeave()?.id ?? null;

    switch (this.dialogAction()) {
      case 'approve':
        return this.store.processingLeaveId() === leaveId &&
          this.store.processingAction() === 'approve'
          ? 'Approving...'
          : 'Approve request';
      case 'reject':
        return this.store.processingLeaveId() === leaveId &&
          this.store.processingAction() === 'reject'
          ? 'Rejecting...'
          : 'Reject request';
      case 'delete':
        return this.store.processingLeaveId() === leaveId &&
          this.store.processingAction() === 'delete'
          ? 'Removing...'
          : this.store.isAdmin()
            ? 'Delete request'
            : 'Cancel request';
      default:
        return 'Continue';
    }
  }

  protected reload(): void {
    void this.store.loadLeaves();
    void this.store.loadSummary();
  }

  protected reloadSummary(): void {
    void this.store.loadSummary();
  }

  protected reloadLeaveTypes(): void {
    void this.store.loadLeaveTypes(true);
  }

  protected exportCsv(): void {
    void this.store.exportLeavesCsv();
  }

  private openActionDialog(leave: LeaveListItem, action: Exclude<LeaveActionType, null>): void {
    this.navigationError.set(null);
    this.store.clearActionError();
    this.pendingLeave.set(leave);
    this.dialogAction.set(action);
    this.rejectionReasonControl.reset('');
    this.actionDialogLauncher().nativeElement.click();
  }
}
