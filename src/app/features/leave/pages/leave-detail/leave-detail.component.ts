import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from 'flowbite-angular/modal';
import { LeaveActionType, LeaveSectionItem } from '../../domain/models/leave.model';
import { LeaveStore } from '../../state/leave.store';
import { LeaveInfoSectionComponent } from '../../ui/leave-info-section/leave-info-section.component';
import { LeaveStatusBadgeComponent } from '../../ui/leave-status-badge/leave-status-badge.component';

@Component({
  selector: 'app-leave-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgpDialogTrigger,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    LeaveInfoSectionComponent,
    LeaveStatusBadgeComponent,
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

      @if (store.actionError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.actionError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearActionError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Leave request details can't be shown right now</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/leave" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else if (store.isDetailLoading() && !store.detail()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-10 w-2/3 rounded-full bg-slate-200"></div>
            <div class="h-24 rounded-[28px] bg-slate-100"></div>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="h-40 rounded-[28px] bg-slate-100"></div>
              <div class="h-40 rounded-[28px] bg-slate-100"></div>
            </div>
          </div>
        </section>
      } @else if (store.detail(); as leave) {
        <button
          #actionDialogLauncher
          type="button"
          class="hidden"
          [ngpDialogTrigger]="actionDialog"
          (ngpDialogTriggerClosed)="resetActionState()"
        ></button>

        <section class="surface-card overflow-hidden p-6">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="inline-flex h-18 w-18 items-center justify-center rounded-[26px] bg-brand-blue text-xl font-bold text-white">
                {{ leave.initials }}
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">{{ leave.employeeCode }}</p>
                  <h2 class="mt-2 text-3xl font-bold text-ui-text">{{ leave.fullName }}</h2>
                  <p class="mt-2 text-sm text-ui-muted">{{ leave.leaveTypeName }} · {{ leave.totalDaysLabel }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <app-leave-status-badge [status]="leave.status" />
                  <span class="rounded-full border border-ui-border bg-ui-bg px-3 py-1.5 text-sm font-medium text-ui-text">
                    {{ leave.requestDateLabel }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              @if (canEdit()) {
                <a [routerLink]="['/leave', leave.id, 'edit']" class="btn-primary">Edit request</a>
              }
              @if (canApproveReject()) {
                <button type="button" class="btn-secondary !text-brand-green" (click)="openApproveDialog()">
                  Approve
                </button>
                <button type="button" class="btn-secondary !text-warning" (click)="openRejectDialog()">
                  Reject
                </button>
              }
              @if (canDelete()) {
                <button type="button" class="btn-secondary !text-danger" (click)="openDeleteDialog()">
                  {{ store.isAdmin() ? 'Delete request' : 'Cancel request' }}
                </button>
              }
              <a routerLink="/leave" class="btn-secondary">Back to list</a>
            </div>
          </div>
        </section>

        <app-leave-info-section
          [title]="'Employee information'"
          [description]="'Basic employee details for this request.'"
          [items]="employeeInfo()"
        />

        <app-leave-info-section
          [title]="'Leave request information'"
          [description]="'Leave dates, status, and reason.'"
          [items]="leaveInfo()"
        />

        <app-leave-info-section
          [title]="'Approval information'"
          [description]="'Approval details and the latest updates.'"
          [items]="approvalInfo()"
        />

        <ng-template #actionDialog let-close="close">
          <div flowbiteModalOverlay position="center">
            <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
              <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">{{ dialogTitle() }}</h3>
              <div flowbiteModalContent class="!space-y-4">
                <p class="muted-copy">{{ dialogDescription() }}</p>
                <div class="rounded-[22px] border border-ui-border bg-ui-bg/70 px-4 py-4">
                  <p class="text-sm font-semibold text-ui-text">{{ leave.fullName }}</p>
                  <p class="mt-1 text-sm text-ui-muted">
                    {{ leave.leaveTypeName }} · {{ leave.startDateLabel }} to {{ leave.endDateLabel }}
                  </p>
                </div>

                @if (dialogAction() === 'reject') {
                  <div class="space-y-2">
                    <label class="field-label" for="detailRejectionReason">Rejection note</label>
                    <textarea
                      id="detailRejectionReason"
                      rows="4"
                      class="field-shell min-h-28 resize-y"
                      [formControl]="rejectionReasonControl"
                      placeholder="Add a reason for rejection"
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
                  [class]="confirmButtonClass()"
                  [disabled]="store.processingLeaveId() !== null"
                  (click)="confirmAction(close)"
                >
                  {{ confirmLabel() }}
                </button>
              </div>
            </section>
          </div>
        </ng-template>
      }
    </section>
  `,
})
export class LeaveDetailComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(LeaveStore);
  private readonly actionDialogLauncher =
    viewChild<ElementRef<HTMLButtonElement>>('actionDialogLauncher');

  protected readonly dialogAction = signal<LeaveActionType>(null);
  protected readonly rejectionReasonControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly employeeInfo = computed<LeaveSectionItem[]>(() => {
    const leave = this.store.detail();

    if (!leave) {
      return [];
    }

    return [
      { label: 'Employee', value: leave.fullName },
      { label: 'Employee code', value: leave.employeeCode },
      { label: 'Department', value: leave.departmentName },
      { label: 'Position', value: leave.positionName },
    ];
  });

  protected readonly leaveInfo = computed<LeaveSectionItem[]>(() => {
    const leave = this.store.detail();

    if (!leave) {
      return [];
    }

    return [
      { label: 'Leave type', value: leave.leaveTypeName },
      { label: 'Request date', value: leave.requestDateLabel },
      { label: 'Start date', value: leave.startDateLabel },
      { label: 'End date', value: leave.endDateLabel },
      { label: 'Total days', value: leave.totalDaysLabel },
      { label: 'Status', value: leave.statusLabel },
      { label: 'Reason', value: leave.reasonLabel },
    ];
  });

  protected readonly approvalInfo = computed<LeaveSectionItem[]>(() => {
    const leave = this.store.detail();

    if (!leave) {
      return [];
    }

    return [
      { label: 'Approver', value: leave.approverNameLabel },
      { label: 'Approved at', value: leave.approvedAtLabel },
      { label: 'Rejection note', value: leave.rejectionReasonLabel },
      { label: 'Created at', value: leave.createdAtLabel },
      { label: 'Updated at', value: leave.updatedAtLabel },
    ];
  });

  constructor() {
    void this.reload();
  }

  protected canEdit(): boolean {
    return this.store.detail()?.status === 'pending';
  }

  protected canDelete(): boolean {
    return this.store.detail()?.status === 'pending';
  }

  protected canApproveReject(): boolean {
    return this.store.isAdmin() && this.store.detail()?.status === 'pending';
  }

  protected openApproveDialog(): void {
    this.openActionDialog('approve');
  }

  protected openRejectDialog(): void {
    this.openActionDialog('reject');
  }

  protected openDeleteDialog(): void {
    this.openActionDialog('delete');
  }

  protected resetActionState(): void {
    this.dialogAction.set(null);
    this.rejectionReasonControl.reset('');
  }

  protected async confirmAction(close: () => void): Promise<void> {
    const leaveId = this.store.detail()?.id;
    const action = this.dialogAction();

    if (!leaveId || !action) {
      return;
    }

    if (action === 'reject') {
      if (this.rejectionReasonControl.invalid) {
        this.rejectionReasonControl.markAsTouched();
        return;
      }

      const rejected = await this.store.rejectLeave(leaveId, this.rejectionReasonControl.value);

      if (rejected) {
        close();
      }

      return;
    }

    const succeeded =
      action === 'approve'
        ? await this.store.approveLeave(leaveId)
        : await this.store.deleteLeave(leaveId);

    if (succeeded) {
      close();

      if (action === 'delete') {
        void this.router.navigate(['/leave']);
      }
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
        return 'Approve this leave request and confirm the employee leave period.';
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
    const leaveId = this.store.detail()?.id ?? null;

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

  protected confirmButtonClass(): string {
    const baseClass = 'btn-primary';

    switch (this.dialogAction()) {
      case 'approve':
        return `${baseClass} !bg-brand-green hover:!bg-brand-greenDark`;
      case 'reject':
        return `${baseClass} !bg-warning hover:!bg-amber-600`;
      case 'delete':
        return `${baseClass} !bg-danger hover:!bg-red-700`;
      default:
        return baseClass;
    }
  }

  protected async reload(): Promise<void> {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    await this.store.loadLeave(id);
  }

  private openActionDialog(action: Exclude<LeaveActionType, null>): void {
    this.store.clearActionError();
    this.dialogAction.set(action);
    this.rejectionReasonControl.reset('');
    this.actionDialogLauncher()?.nativeElement.click();
  }
}
