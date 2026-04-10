import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LeaveStore } from '../../state/leave.store';
import { LeaveFormComponent } from '../../ui/leave-form/leave-form.component';
import {
  buildLeaveForm,
  getLeaveFormValue,
} from '../../ui/leave-form/leave-form.utils';

@Component({
  selector: 'app-leave-create',
  standalone: true,
  imports: [RouterLink, LeaveFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.referenceError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Employee options are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.referenceError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/leave" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      }

      <section class="surface-card p-6">
        <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-ui-text">Add leave request</h2>
            <p class="mt-1 muted-copy">Create a new leave request and complete the required details.</p>
          </div>
          <a routerLink="/leave" class="btn-secondary">Back to list</a>
        </div>
      </section>

      <app-leave-form
        [form]="form"
        [mode]="'create'"
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
    </section>
  `,
})
export class LeaveCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(LeaveStore);
  protected readonly form = buildLeaveForm();

  protected readonly selectedEmployeeLabel = computed(() => {
    const employee = this.store.employeeOptions()[0];

    if (!employee || this.store.isAdmin()) {
      return '';
    }

    return `${employee.fullName} - ${employee.employeeCode}`;
  });

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    const createdLeave = await this.store.createLeave(getLeaveFormValue(this.form));

    if (createdLeave) {
      void this.router.navigate(['/leave']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/leave']);
  }

  protected async reload(): Promise<void> {
    await this.store.loadEmployeeOptions(true);
    this.prefillEmployee();
  }

  private prefillEmployee(): void {
    const currentUserId = this.store.authenticatedUser()?.id;

    if (currentUserId && !this.store.isAdmin()) {
      this.form.controls.userId.setValue(currentUserId);
    }
  }
}
