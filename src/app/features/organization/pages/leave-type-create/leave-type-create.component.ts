import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { LeaveTypeFormComponent } from '../../ui/leave-type-form/leave-type-form.component';
import {
  buildLeaveTypeForm,
  getLeaveTypeFormValue,
} from '../../ui/leave-type-form/leave-type-form.utils';

@Component({
  selector: 'app-leave-type-create',
  standalone: true,
  imports: [RouterLink, LeaveTypeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <section class="surface-card p-6">
        <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-ui-text">Add leave type</h2>
            <p class="mt-1 muted-copy">Create a leave type that can be used in leave request forms.</p>
          </div>
          <a routerLink="/organization/leave-types" class="btn-secondary">Back to leave types</a>
        </div>
      </section>

      <app-leave-type-form
        [form]="form"
        [submitLabel]="'Create leave type'"
        [isSubmitting]="store.isLeaveTypeSubmitting()"
        [submitError]="store.leaveTypeSubmitError()"
        [fieldErrors]="store.leaveTypeFormErrors()"
        (submitForm)="save()"
        (cancelForm)="goBack()"
      />
    </section>
  `,
})
export class LeaveTypeCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildLeaveTypeForm();

  protected async save(): Promise<void> {
    const leaveType = await this.store.createLeaveType(getLeaveTypeFormValue(this.form));

    if (leaveType) {
      void this.router.navigate(['/organization', 'leave-types']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'leave-types']);
  }
}
