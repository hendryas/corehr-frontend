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
import { EmployeeListItem, EmployeeStatusFilter } from '../../domain/models/employee.model';
import { EmployeesStore } from '../../state/employees.store';
import { EmployeesTableComponent } from '../../ui/employees-table/employees-table.component';

@Component({
  selector: 'app-employee-list',
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
    EmployeesTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.deleteSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Employee deleted</p>
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

      <div class="surface-card p-6">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto] xl:items-end">
          <label class="space-y-2">
            <span class="field-label">Search employees</span>
            <span class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-ui-muted">
                <app-icon name="search" iconClass="h-4 w-4" />
              </span>
              <input
                type="search"
                class="field-shell pl-11"
                [formControl]="searchControl"
                placeholder="Search name, email, or employee code"
              />
            </span>
          </label>

          <label class="space-y-2">
            <span class="field-label">Status</span>
            <select class="field-shell" [value]="store.filters().status" (change)="onStatusChange($any($event.target).value)">
              <option value="all">All employees</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <button
            type="button"
            class="btn-secondary justify-center xl:min-w-44"
            [disabled]="store.isExportingCsv()"
            (click)="exportCsv()"
          >
            <app-icon name="download" iconClass="h-4 w-4" />
            {{ store.isExportingCsv() ? 'Exporting...' : 'Export CSV' }}
          </button>

          <button type="button" class="btn-primary justify-center xl:min-w-44" (click)="openCreate()">
            Add employee
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
            <p class="text-base font-semibold text-ui-text">Employee data can't be shown right now</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.listError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isListLoading() && !store.hasEmployees()) {
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
            <p class="text-base font-semibold text-ui-text">No employees found</p>
            <p class="mt-2 text-sm text-ui-muted">
              Try another search or status filter, or add a new employee.
            </p>
          </div>
          <button type="button" class="btn-primary" (click)="openCreate()">Add employee</button>
        </div>
      } @else {
        <app-employees-table
          [employees]="store.employees()"
          [pagination]="store.pagination()"
          [deletingEmployeeId]="store.deletingEmployeeId()"
          (viewEmployee)="openDetail($event)"
          (editEmployee)="openEdit($event)"
          (deleteEmployee)="openDeleteDialog($event)"
          (pageChange)="changePage($event)"
        />
      }

      <ng-template #deleteDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Delete employee</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">
                This action will remove <strong>{{ pendingDelete()?.fullName }}</strong> from the employee list.
              </p>
              <div class="rounded-[22px] border border-danger/15 bg-danger/5 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingDelete()?.employeeCode }}</p>
                <p class="mt-1 text-sm text-ui-muted">{{ pendingDelete()?.email }}</p>
              </div>
              <p class="text-xs leading-5 text-ui-muted">
                Make sure you selected the right employee before continuing.
              </p>
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button type="button" class="btn-secondary" [disabled]="store.deletingEmployeeId() !== null" (click)="close()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary !bg-danger hover:!bg-red-700"
                [disabled]="store.deletingEmployeeId() !== null"
                (click)="confirmDelete(close)"
              >
                {{ store.deletingEmployeeId() !== null ? 'Deleting...' : 'Delete employee' }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class EmployeeListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(EmployeesStore);
  private readonly deleteDialogLauncher = viewChild.required<ElementRef<HTMLButtonElement>>('deleteDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingDelete = signal<EmployeeListItem | null>(null);
  protected readonly navigationError = signal<string | null>(null);
  protected readonly searchControl = new FormControl(this.store.filters().search, {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updateSearch(value);
        void this.store.loadEmployees();
      });

    void this.store.loadEmployees();
  }

  protected onStatusChange(value: EmployeeStatusFilter): void {
    this.navigationError.set(null);
    this.store.updateStatus(value);
    void this.store.loadEmployees();
  }

  protected changePage(page: number): void {
    this.store.updatePage(page);
    void this.store.loadEmployees();
  }

  protected openDetail(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/employees', id]);
  }

  protected openEdit(id: number): void {
    this.navigationError.set(null);
    void this.router.navigate(['/employees', id, 'edit']);
  }

  protected async openCreate(): Promise<void> {
    this.navigationError.set(null);

    try {
      const navigated = await this.router.navigate(['/employees', 'new']);

      if (!navigated) {
        this.navigationError.set("The employee form couldn't be opened. Please try again.");
      }
    } catch {
      this.navigationError.set("The employee form couldn't be opened. Please try again.");
    }
  }

  protected openDeleteDialog(employee: EmployeeListItem): void {
    this.navigationError.set(null);
    this.store.clearDeleteError();
    this.pendingDelete.set(employee);
    this.deleteDialogLauncher().nativeElement.click();
  }

  protected resetDeleteState(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(close: () => void): Promise<void> {
    const employee = this.pendingDelete();

    if (!employee) {
      return;
    }

    const deleted = await this.store.deleteEmployee(employee.id);

    if (deleted) {
      close();
    }
  }

  protected reload(): void {
    void this.store.loadEmployees();
  }

  protected exportCsv(): void {
    void this.store.exportEmployeesCsv();
  }
}
