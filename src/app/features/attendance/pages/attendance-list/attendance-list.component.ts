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
import { AttendanceListItem, AttendanceStatusFilter } from '../../domain/models/attendance.model';
import { AttendanceStore } from '../../state/attendance.store';
import { AttendanceTableComponent } from '../../ui/attendance-table/attendance-table.component';

@Component({
  selector: 'app-attendance-list',
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
    AttendanceTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <section class="surface-card p-6">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Today attendance</p>
              <h2 class="mt-2 text-2xl font-bold text-ui-text">{{ store.todayAttendanceState().title }}</h2>
              <p class="mt-2 muted-copy">{{ store.todayAttendanceState().description }}</p>
            </div>

            @if (store.isTodayAttendanceLoading()) {
              <p class="text-sm text-ui-muted">Loading today attendance status...</p>
            } @else if (store.todayAttendanceError()) {
              <div class="rounded-[20px] border border-warning/20 bg-warning/5 px-4 py-3">
                <p class="text-sm font-medium text-warning">{{ store.todayAttendanceError() }}</p>
              </div>
            } @else if (store.todayAttendance(); as todayAttendance) {
              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-[22px] border border-ui-border bg-ui-surface px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ui-muted">Attendance date</p>
                  <p class="mt-2 text-sm font-semibold text-ui-text">{{ todayAttendance.attendanceDateLabel }}</p>
                </div>
                <div class="rounded-[22px] border border-ui-border bg-ui-surface px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ui-muted">Check in</p>
                  <p class="mt-2 text-sm font-semibold text-ui-text">{{ todayAttendance.checkInLabel }}</p>
                </div>
                <div class="rounded-[22px] border border-ui-border bg-ui-surface px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ui-muted">Check out</p>
                  <p class="mt-2 text-sm font-semibold text-ui-text">{{ todayAttendance.checkOutLabel }}</p>
                </div>
              </div>
            }

            @if (store.todayAttendanceSubmitError()) {
              <div class="rounded-[20px] border border-danger/20 bg-danger/5 px-4 py-3">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm font-medium text-danger">{{ store.todayAttendanceSubmitError() }}</p>
                  <button type="button" class="btn-secondary" (click)="store.clearTodayAttendanceSubmitError()">Dismiss</button>
                </div>
              </div>
            }
          </div>

          <div class="flex flex-col gap-3 lg:min-w-60">
            @if (store.todayAttendanceState().action === 'completed' || store.todayAttendanceState().action === 'unavailable') {
              <button type="button" class="btn-secondary justify-center" disabled>
                {{ store.todayAttendanceState().actionLabel }}
              </button>
            } @else {
              <button
                type="button"
                class="btn-primary justify-center"
                [disabled]="store.isTodayAttendanceLoading() || store.isTodayAttendanceSubmitting()"
                (click)="handleTodayAttendanceAction()"
              >
                {{
                  store.isTodayAttendanceSubmitting()
                    ? store.todayAttendanceState().action === 'check-in'
                      ? 'Checking in...'
                      : 'Checking out...'
                    : store.todayAttendanceState().actionLabel
                }}
              </button>
            }

            <p class="text-sm text-ui-muted">
              Personal attendance actions are validated again by the backend, including approved leave checks for today.
            </p>
          </div>
        </div>
      </section>

      @if (store.deleteSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Attendance removed</p>
                <p class="mt-1 text-sm text-ui-muted">{{ store.deleteSuccessMessage() }}</p>
              </div>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-sm font-semibold text-ui-muted transition hover:bg-slate-100 hover:text-ui-text"
                (click)="store.clearDeleteSuccessMessage()"
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

      @if (store.summaryError()) {
        <div class="rounded-[24px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-ui-text">Attendance summary is partially unavailable</p>
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
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto] xl:items-end">
          <label class="space-y-2">
            <span class="field-label">Search attendance</span>
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
              <option value="present">Present</option>
              <option value="sick">Sick</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="field-label">Attendance date</span>
            <input
              type="date"
              class="field-shell"
              [value]="store.filters().attendanceDate"
              (change)="onDateChange($any($event.target).value)"
            />
          </label>

          @if (store.isAdmin()) {
            <button
              type="button"
              class="btn-secondary justify-center xl:min-w-44"
              [disabled]="store.isExportingCsv()"
              (click)="exportCsv()"
            >
              <app-icon name="download" iconClass="h-4 w-4" />
              {{ store.isExportingCsv() ? 'Exporting...' : 'Export CSV' }}
            </button>
          }

          @if (store.isAdmin()) {
            <button type="button" class="btn-primary justify-center xl:min-w-44" (click)="openCreate()">
              Add attendance
            </button>
          }
        </div>
      </div>

      <button
        #deleteDialogLauncher
        type="button"
        class="hidden"
        [ngpDialogTrigger]="deleteDialog"
        (ngpDialogTriggerClosed)="resetDeleteState()"
      ></button>

      @if (store.deleteError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.deleteError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearDeleteError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.listError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Attendance history is unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.listError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isListLoading() && !store.hasAttendances()) {
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
            <p class="text-base font-semibold text-ui-text">No attendance records found</p>
            <p class="mt-2 text-sm text-ui-muted">
              Adjust the filters or add a new attendance record to continue.
            </p>
          </div>
          @if (store.isAdmin()) {
            <button type="button" class="btn-primary" (click)="openCreate()">Add attendance</button>
          }
        </div>
      } @else {
        <app-attendance-table
          [attendances]="store.filteredAttendances()"
          [pagination]="store.pagination()"
          [deletingAttendanceId]="store.deletingAttendanceId()"
          [canManage]="store.isAdmin()"
          (viewAttendance)="openDetail($event)"
          (editAttendance)="openEdit($event)"
          (deleteAttendance)="openDeleteDialog($event)"
          (pageChange)="changePage($event)"
        />
      }

      <ng-template #deleteDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Delete attendance</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">
                This will remove the attendance record for <strong>{{ pendingDelete()?.fullName }}</strong>.
              </p>
              <div class="rounded-[22px] border border-danger/15 bg-danger/5 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingDelete()?.attendanceDateLabel }}</p>
                <p class="mt-1 text-sm text-ui-muted">{{ pendingDelete()?.statusLabel }}</p>
              </div>
              <p class="text-xs leading-5 text-ui-muted">
                Please make sure this is the correct attendance record before continuing.
              </p>
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button type="button" class="btn-secondary" [disabled]="store.deletingAttendanceId() !== null" (click)="close()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary !bg-danger hover:!bg-red-700"
                [disabled]="store.deletingAttendanceId() !== null"
                (click)="confirmDelete(close)"
              >
                {{ store.deletingAttendanceId() !== null ? 'Deleting...' : 'Delete attendance' }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class AttendanceListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(AttendanceStore);
  private readonly deleteDialogLauncher =
    viewChild.required<ElementRef<HTMLButtonElement>>('deleteDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingDelete = signal<AttendanceListItem | null>(null);
  protected readonly navigationError = signal<string | null>(null);
  protected readonly searchControl = new FormControl(this.store.filters().search, {
    nonNullable: true,
  });

  protected readonly summaryCards = computed(() => {
    const summary = this.store.summary();
    const isLoading = this.store.isSummaryLoading();

    return [
      {
        label: 'Total records',
        value: this.store.isListLoading() ? '...' : String(summary.totalRecords),
        delta: 'Across the current attendance list',
        barClass: 'bg-brand-blue',
        deltaClass: 'text-brand-blue',
      },
      {
        label: 'Present today',
        value: isLoading ? '...' : String(summary.presentToday),
        delta: 'Marked present for today',
        barClass: 'bg-brand-green',
        deltaClass: 'text-brand-green',
      },
      {
        label: 'Sick today',
        value: isLoading ? '...' : String(summary.sickToday),
        delta: 'Marked sick for today',
        barClass: 'bg-info',
        deltaClass: 'text-info',
      },
      {
        label: 'Absent today',
        value: isLoading ? '...' : String(summary.absentToday),
        delta: 'Marked absent for today',
        barClass: 'bg-brand-gold',
        deltaClass: 'text-brand-gold',
      },
    ];
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updateSearch(value);
        void this.store.loadAttendances();
      });

    void this.store.loadAttendances();
    void this.store.loadSummary();
    void this.store.loadTodayAttendance();
  }

  protected onStatusChange(value: AttendanceStatusFilter): void {
    this.navigationError.set(null);
    this.store.updateStatus(value);
    void this.store.loadAttendances();
  }

  protected onDateChange(value: string): void {
    this.navigationError.set(null);
    this.store.updateDate(value);
    void this.store.loadAttendances();
  }

  protected changePage(page: number): void {
    this.store.updatePage(page);
    void this.store.loadAttendances();
  }

  protected openDetail(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/attendance', id]);
  }

  protected openEdit(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/attendance', id, 'edit']);
  }

  protected async openCreate(): Promise<void> {
    this.navigationError.set(null);

    try {
      const navigated = await this.router.navigate(['/attendance', 'new']);

      if (!navigated) {
        this.navigationError.set('The add attendance page could not be opened. Please try again.');
      }
    } catch {
      this.navigationError.set('The add attendance page could not be opened. Please try again.');
    }
  }

  protected openDeleteDialog(attendance: AttendanceListItem): void {
    this.navigationError.set(null);
    this.store.clearDeleteError();
    this.pendingDelete.set(attendance);
    this.deleteDialogLauncher().nativeElement.click();
  }

  protected resetDeleteState(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(close: () => void): Promise<void> {
    const attendance = this.pendingDelete();

    if (!attendance) {
      return;
    }

    const deleted = await this.store.deleteAttendance(attendance.id);

    if (deleted) {
      close();
    }
  }

  protected reload(): void {
    void this.store.loadAttendances();
    void this.store.loadSummary();
    void this.store.loadTodayAttendance();
  }

  protected reloadSummary(): void {
    void this.store.loadSummary();
  }

  protected handleTodayAttendanceAction(): void {
    void this.store.submitTodayAttendanceAction();
  }

  protected exportCsv(): void {
    void this.store.exportAttendancesCsv();
  }
}
