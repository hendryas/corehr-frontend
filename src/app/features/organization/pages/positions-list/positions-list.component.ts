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
import { PositionListItem } from '../../domain/models/organization.model';
import { OrganizationStore } from '../../state/organization.store';
import { PositionsTableComponent } from '../../ui/positions-table/positions-table.component';

@Component({
  selector: 'app-positions-list',
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
    PositionsTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.positionSuccessMessage()) {
        <div class="pointer-events-none fixed right-4 top-24 z-50 sm:right-6">
          <div class="toast-shell pointer-events-auto max-w-sm">
            <div class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-ui-text">Position updated</p>
                <p class="mt-1 text-sm text-ui-muted">{{ store.positionSuccessMessage() }}</p>
              </div>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-sm font-semibold text-ui-muted transition hover:bg-slate-100 hover:text-ui-text"
                (click)="store.clearPositionSuccessMessage()"
              >
                x
              </button>
            </div>
          </div>
        </div>
      }

      <div class="surface-card p-6">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px_auto] xl:items-end">
          <label class="space-y-2">
            <span class="field-label">Search positions</span>
            <span class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-ui-muted">
                <app-icon name="search" iconClass="h-4 w-4" />
              </span>
              <input
                type="search"
                class="field-shell pl-11"
                [formControl]="searchControl"
                placeholder="Search position name"
              />
            </span>
          </label>

          <label class="space-y-2">
            <span class="field-label">Department</span>
            <select class="field-shell" [value]="selectedDepartmentValue()" (change)="onDepartmentChange($event)">
              <option value="all">All departments</option>
              @for (department of store.departments(); track department.id) {
                <option [value]="department.id">{{ department.name }}</option>
              }
            </select>
          </label>

          <button type="button" class="btn-primary justify-center xl:min-w-44" (click)="openCreate()">
            Add position
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

      @if (store.positionDeleteError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-danger">{{ store.positionDeleteError() }}</p>
            <button type="button" class="btn-secondary" (click)="store.clearPositionDeleteError()">Dismiss</button>
          </div>
        </div>
      }

      @if (store.positionsError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Positions are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.positionsError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reload()">Retry</button>
        </div>
      } @else if (store.isPositionsLoading() && !store.hasPositions()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 w-56 rounded-full bg-slate-200"></div>
            @for (placeholder of placeholderRows; track placeholder) {
              <div class="h-18 rounded-[24px] bg-slate-100"></div>
            }
          </div>
        </section>
      } @else if (store.isPositionsEmpty()) {
        <div class="state-panel">
          <div>
            <p class="text-base font-semibold text-ui-text">No positions found</p>
            <p class="mt-2 text-sm text-ui-muted">
              Adjust the search term or add a new position to continue.
            </p>
          </div>
          <button type="button" class="btn-primary" (click)="openCreate()">Add position</button>
        </div>
      } @else {
        <app-positions-table
          [positions]="store.filteredPositions()"
          [deletingPositionId]="store.deletingPositionId()"
          (editPosition)="openEdit($event)"
          (deletePosition)="openDeleteDialog($event)"
        />
      }

      <ng-template #deleteDialog let-close="close">
        <div flowbiteModalOverlay position="center">
          <section flowbiteModal size="md" class="!border !border-ui-border !bg-ui-surface">
            <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Delete position</h3>
            <div flowbiteModalContent class="!space-y-4">
              <p class="muted-copy">
                This will remove <strong>{{ pendingDelete()?.name }}</strong> from the position list.
              </p>
              <div class="rounded-[22px] border border-danger/15 bg-danger/5 px-4 py-4">
                <p class="text-sm font-semibold text-ui-text">{{ pendingDelete()?.name }}</p>
                <p class="mt-1 text-sm text-ui-muted">{{ pendingDelete()?.departmentName }}</p>
              </div>
              <p class="text-xs leading-5 text-ui-muted">
                Please make sure this position is no longer assigned to active employees before continuing.
              </p>
            </div>
            <div flowbiteModalFooter class="!justify-end !border-ui-border">
              <button type="button" class="btn-secondary" [disabled]="store.deletingPositionId() !== null" (click)="close()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary !bg-danger hover:!bg-red-700"
                [disabled]="store.deletingPositionId() !== null"
                (click)="confirmDelete(close)"
              >
                {{ store.deletingPositionId() !== null ? 'Deleting...' : 'Delete position' }}
              </button>
            </div>
          </section>
        </div>
      </ng-template>
    </section>
  `,
})
export class PositionsListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  private readonly deleteDialogLauncher =
    viewChild.required<ElementRef<HTMLButtonElement>>('deleteDialogLauncher');

  protected readonly placeholderRows = Array.from({ length: 6 }, (_, index) => index + 1);
  protected readonly pendingDelete = signal<PositionListItem | null>(null);
  protected readonly searchControl = new FormControl(this.store.positionFilters().search, {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.store.updatePositionSearch(value);
      });

    void Promise.all([this.store.loadDepartments(), this.store.loadPositions()]);
  }

  protected selectedDepartmentValue(): string {
    const value = this.store.positionFilters().departmentId;
    return value === 'all' ? 'all' : String(value);
  }

  protected onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.updatePositionDepartmentFilter(value === 'all' ? 'all' : Number(value));
  }

  protected openCreate(): void {
    void this.router.navigate(['/organization', 'positions', 'new']);
  }

  protected openEdit(id: number): void {
    void this.router.navigate(['/organization', 'positions', id, 'edit']);
  }

  protected openDeleteDialog(position: PositionListItem): void {
    this.store.clearPositionDeleteError();
    this.pendingDelete.set(position);
    this.deleteDialogLauncher().nativeElement.click();
  }

  protected resetDeleteState(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(close: () => void): Promise<void> {
    const position = this.pendingDelete();

    if (!position) {
      return;
    }

    const deleted = await this.store.deletePosition(position.id);

    if (deleted) {
      close();
    }
  }

  protected reload(): void {
    void this.store.loadPositions(true);
  }
}
