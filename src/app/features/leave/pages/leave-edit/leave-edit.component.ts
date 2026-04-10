import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LeaveStore } from '../../state/leave.store';
import { LeaveFormComponent } from '../../ui/leave-form/leave-form.component';
import {
  buildLeaveForm,
  getLeaveFormValue,
  patchLeaveForm,
} from '../../ui/leave-form/leave-form.utils';

@Component({
  selector: 'app-leave-edit',
  standalone: true,
  imports: [RouterLink, LeaveFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Leave request detail could not be loaded</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/leave" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else if (store.detail() && !canEdit()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">This request can no longer be edited</p>
            <p class="mt-2 text-sm text-ui-muted">
              Only pending leave requests can be updated.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a [routerLink]="['/leave', leaveId]" class="btn-secondary">View detail</a>
            <a routerLink="/leave" class="btn-secondary">Back to list</a>
          </div>
        </div>
      } @else {
        <section class="surface-card p-6">
          <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-ui-text">Edit leave request</h2>
              <p class="mt-1 muted-copy">Update the leave period or request reason while the request is still pending.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              @if (leaveId) {
                <a [routerLink]="['/leave', leaveId]" class="btn-secondary">View detail</a>
              }
              <a routerLink="/leave" class="btn-secondary">Back to list</a>
            </div>
          </div>
        </section>

        <app-leave-form
          [form]="form"
          [mode]="'edit'"
          [employeeOptions]="store.employeeOptions()"
          [leaveTypeOptions]="store.availableLeaveTypes()"
          [showEmployeeField]="store.isAdmin()"
          [selectedEmployeeLabel]="selectedEmployeeLabel()"
          [isReferenceLoading]="store.isReferenceLoading()"
          [isSubmitting]="store.isSubmitting()"
          [submitError]="store.submitError()"
          [fieldErrors]="store.formErrors()"
          (submitForm)="save()"
          (cancelForm)="goBack()"
        />
      }
    </section>
  `,
})
export class LeaveEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(LeaveStore);
  protected readonly form = buildLeaveForm();
  protected readonly leaveId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

  protected readonly selectedEmployeeLabel = computed(() => {
    const leave = this.store.detail();

    if (!leave || this.store.isAdmin()) {
      return '';
    }

    return `${leave.fullName} - ${leave.employeeCode}`;
  });

  constructor() {
    void this.reload();
  }

  protected canEdit(): boolean {
    return this.store.detail()?.status === 'pending';
  }

  protected async save(): Promise<void> {
    if (!this.leaveId) {
      return;
    }

    const updatedLeave = await this.store.updateLeave(
      this.leaveId,
      getLeaveFormValue(this.form),
    );

    if (updatedLeave) {
      void this.router.navigate(['/leave', this.leaveId]);
    }
  }

  protected goBack(): void {
    if (this.leaveId) {
      void this.router.navigate(['/leave', this.leaveId]);
      return;
    }

    void this.router.navigate(['/leave']);
  }

  protected async reload(): Promise<void> {
    if (!this.leaveId) {
      return;
    }

    await this.store.loadEmployeeOptions(true);
    await this.store.loadLeave(this.leaveId);

    const leave = this.store.detail();

    if (!leave) {
      return;
    }

    patchLeaveForm(this.form, leave);
  }
}
