import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { LeaveTypeListItem } from '../../../leave/domain/models/leave-type.model';
import { OrganizationStore } from '../../state/organization.store';
import { LeaveTypesTableComponent } from '../../ui/leave-types-table/leave-types-table.component';

@Component({
  selector: 'app-leave-types-list',
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
    LeaveTypesTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.leaveTypeSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Leave type updated</p>
                <p class="mt-1 text-sm text-ui-muted">{{ store.leaveTypeSuccessMessage() }}</p>
              </div>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-sm font-semibold text-ui-muted transition hover:bg-slate-100 hover:text-ui-text"
                (click)="store.clearLeaveTypeSuccessMessage()"
              >
                x
              </button>
            </div>
          </div>
        </div>
      }

      <div class="surface-card p-6">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <label class="space-y-2">
            <span class="field-label">Search leave types</span>
            <span class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-ui-muted">
                <app-icon name="search" iconClass="h-4 w-4" />
              </span>
              <input
                type="search"
                class="field-shell pl-11"
                [formControl]="searchControl"
                placeholder="Search code or leave type name"
              />
            </span>
          </label>

          <button type="button" class="btn-primary justify-center xl:min-w-44" (click)="openCreate()">
            Add leave type
          </button>
        </div>
      </div>

      <button
        #deleteDialogLauncher
        type="button"
        class="hidden"
        [ngpDialogTrigger]="deleteDialog"
        (ngpDialogTriggerClosed)="resetDeleteState()"
      ></button>

      @if (store.leaveTypeDeleteError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.leaveTypeDeleteError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearLeaveTypeDeleteError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.leaveTypesError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Leave types can't be shown right now</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.leaveTypesError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isLeaveTypesLoading() && !store.hasLeaveTypes()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 w-56 rounded-full bg-slate-200"></div>
            @for (placeholder of placeholderRows; track placeholder) {
              <div class="h-18 rounded-[24px] bg-slate-100"></div>
            }
          </div>
        </section>
      } @else if (store.isLeaveTypesEmpty()) {
        <div class="state-panel">
          <div>
            <p class="text-base font-semibold text-ui-text">No leave types found</p>
            <p class="mt-2 text-sm text-ui-muted">Add a leave type so it can be used in leave requests.</p>
          </div>
          <button type="button" class="btn-primary" (click)="openCreate()">Add leave type</button>
        </div>
      } @else {
        <app-leave-types-table
          [leaveTypes]="store.filteredLeaveTypes()"
          [deletingLeaveTypeId]="store.deletingLeaveTypeId()"
          (editLeaveType)="openEdit($event)"
          (deleteLeaveType)="openDeleteDialog($event)"
        />
      }

      <ng-template #deleteDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Delete leave type</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">
                This will remove <strong>{{ pendingDelete()?.name }}</strong> from the leave type list.
              </p>
              <div class="rounded-[22px] border border-danger/15 bg-danger/5 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingDelete()?.name }}</p>
                <p class="mt-1 text-sm text-ui-muted">{{ pendingDelete()?.code }}</p>
              </div>
              <p class="text-xs leading-5 text-ui-muted">
                Make sure this leave type is no longer being used before continuing.
              </p>
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button type="button" class="btn-secondary" [disabled]="store.deletingLeaveTypeId() !== null" (click)="close()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary !bg-danger hover:!bg-red-700"
                [disabled]="store.deletingLeaveTypeId() !== null"
                (click)="confirmDelete(close)"
              >
                {{ store.deletingLeaveTypeId() !== null ? 'Deleting...' : 'Delete leave type' }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class LeaveTypesListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  private readonly deleteDialogLauncher =
    viewChild.required<ElementRef<HTMLButtonElement>>('deleteDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingDelete = signal<LeaveTypeListItem | null>(null);
  protected readonly searchControl = new FormControl(this.store.leaveTypeFilters().search, {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updateLeaveTypeSearch(value);
      });

    void this.store.loadLeaveTypes();
  }

  protected openCreate(): void {
    void this.router.navigate(['/organization', 'leave-types', 'new']);
  }

  protected openEdit(id: number): void {
    void this.router.navigate(['/organization', 'leave-types', id, 'edit']);
  }

  protected openDeleteDialog(leaveType: LeaveTypeListItem): void {
    this.store.clearLeaveTypeDeleteError();
    this.pendingDelete.set(leaveType);
    this.deleteDialogLauncher().nativeElement.click();
  }

  protected resetDeleteState(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(close: () => void): Promise<void> {
    const leaveType = this.pendingDelete();

    if (!leaveType) {
      return;
    }

    const deleted = await this.store.deleteLeaveType(leaveType.id);

    if (deleted) {
      close();
    }
  }

  protected reload(): void {
    void this.store.loadLeaveTypes(true);
  }
}
