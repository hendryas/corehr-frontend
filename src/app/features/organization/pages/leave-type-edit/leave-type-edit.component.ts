import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { LeaveTypeFormComponent } from '../../ui/leave-type-form/leave-type-form.component';
import {
  buildLeaveTypeForm,
  getLeaveTypeFormValue,
  patchLeaveTypeForm,
} from '../../ui/leave-type-form/leave-type-form.utils';

@Component({
  selector: 'app-leave-type-edit',
  standalone: true,
  imports: [RouterLink, LeaveTypeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.leaveTypeDetailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Leave type detail could not be loaded</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.leaveTypeDetailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/organization/leave-types" class="btn-secondary">Back to leave types</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else {
        <section class="surface-card p-6">
          <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-ui-text">Edit leave type</h2>
              <p class="mt-1 muted-copy">Update the leave type details used across leave requests.</p>
            </div>
            <a routerLink="/organization/leave-types" class="btn-secondary">Back to leave types</a>
          </div>
        </section>

        <app-leave-type-form
          [form]="form"
          [submitLabel]="'Save changes'"
          [isSubmitting]="store.isLeaveTypeSubmitting()"
          [submitError]="store.leaveTypeSubmitError()"
          [fieldErrors]="store.leaveTypeFormErrors()"
          (submitForm)="save()"
          (cancelForm)="goBack()"
        />
      }
    </section>
  `,
})
export class LeaveTypeEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildLeaveTypeForm();
  protected readonly leaveTypeId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    if (!this.leaveTypeId) {
      return;
    }

    const leaveType = await this.store.updateLeaveType(
      this.leaveTypeId,
      getLeaveTypeFormValue(this.form),
    );

    if (leaveType) {
      void this.router.navigate(['/organization', 'leave-types']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'leave-types']);
  }

  protected async reload(): Promise<void> {
    if (!this.leaveTypeId) {
      return;
    }

    await this.store.loadLeaveType(this.leaveTypeId);
    const leaveType = this.store.leaveTypeDetail();

    if (!leaveType) {
      return;
    }

    patchLeaveTypeForm(this.form, leaveType);
  }
}
