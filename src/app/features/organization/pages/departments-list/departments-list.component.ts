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
import { DepartmentListItem } from '../../domain/models/organization.model';
import { OrganizationStore } from '../../state/organization.store';
import { DepartmentsTableComponent } from '../../ui/departments-table/departments-table.component';

@Component({
  selector: 'app-departments-list',
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
    DepartmentsTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.departmentSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Department updated</p>
                <p class="mt-1 text-sm text-ui-muted">{{ store.departmentSuccessMessage() }}</p>
              </div>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-sm font-semibold text-ui-muted transition hover:bg-slate-100 hover:text-ui-text"
                (click)="store.clearDepartmentSuccessMessage()"
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
            <span class="field-label">Search departments</span>
            <span class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-ui-muted">
                <app-icon name="search" iconClass="h-4 w-4" />
              </span>
              <input
                type="search"
                class="field-shell pl-11"
                [formControl]="searchControl"
                placeholder="Search department name"
              />
            </span>
          </label>

          <button type="button" class="btn-primary justify-center xl:min-w-44" (click)="openCreate()">
            Add department
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

      @if (store.departmentDeleteError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.departmentDeleteError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearDepartmentDeleteError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.departmentsError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Departments are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.departmentsError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isDepartmentsLoading() && !store.hasDepartments()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 w-56 rounded-full bg-slate-200"></div>
            @for (placeholder of placeholderRows; track placeholder) {
              <div class="h-18 rounded-[24px] bg-slate-100"></div>
            }
          </div>
        </section>
      } @else if (store.isDepartmentsEmpty()) {
        <div class="state-panel">
          <div>
            <p class="text-base font-semibold text-ui-text">No departments found</p>
            <p class="mt-2 text-sm text-ui-muted">
              Adjust the search term or add a new department to continue.
            </p>
          </div>
          <button type="button" class="btn-primary" (click)="openCreate()">Add department</button>
        </div>
      } @else {
        <app-departments-table
          [departments]="store.filteredDepartments()"
          [deletingDepartmentId]="store.deletingDepartmentId()"
          (editDepartment)="openEdit($event)"
          (deleteDepartment)="openDeleteDialog($event)"
        />
      }

      <ng-template #deleteDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Delete department</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">
                This will remove <strong>{{ pendingDelete()?.name }}</strong> from the organization structure.
              </p>
              <div class="rounded-[22px] border border-danger/15 bg-danger/5 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingDelete()?.name }}</p>
                <p class="mt-1 text-sm text-ui-muted">{{ pendingDelete()?.descriptionLabel }}</p>
              </div>
              <p class="text-xs leading-5 text-ui-muted">
                Please make sure this department is no longer being used before continuing.
              </p>
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button type="button" class="btn-secondary" [disabled]="store.deletingDepartmentId() !== null" (click)="close()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary !bg-danger hover:!bg-red-700"
                [disabled]="store.deletingDepartmentId() !== null"
                (click)="confirmDelete(close)"
              >
                {{ store.deletingDepartmentId() !== null ? 'Deleting...' : 'Delete department' }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class DepartmentsListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  private readonly deleteDialogLauncher =
    viewChild.required<ElementRef<HTMLButtonElement>>('deleteDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingDelete = signal<DepartmentListItem | null>(null);
  protected readonly searchControl = new FormControl(this.store.departmentFilters().search, {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updateDepartmentSearch(value);
      });

    void this.store.loadDepartments();
  }

  protected openCreate(): void {
    void this.router.navigate(['/organization', 'departments', 'new']);
  }

  protected openEdit(id: number): void {
    void this.router.navigate(['/organization', 'departments', id, 'edit']);
  }

  protected openDeleteDialog(department: DepartmentListItem): void {
    this.store.clearDepartmentDeleteError();
    this.pendingDelete.set(department);
    this.deleteDialogLauncher().nativeElement.click();
  }

  protected resetDeleteState(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(close: () => void): Promise<void> {
    const department = this.pendingDelete();

    if (!department) {
      return;
    }

    const deleted = await this.store.deleteDepartment(department.id);

    if (deleted) {
      close();
    }
  }

  protected reload(): void {
    void this.store.loadDepartments(true);
  }
}
