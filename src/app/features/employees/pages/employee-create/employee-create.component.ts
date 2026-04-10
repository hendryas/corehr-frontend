import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EmployeesStore } from '../../state/employees.store';
import { EmployeeFormComponent } from '../../ui/employee-form/employee-form.component';
import {
  buildEmployeeForm,
  getEmployeeFormValue,
} from '../../ui/employee-form/employee-form.utils';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [RouterLink, EmployeeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <div class="surface-card p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Employee onboarding</p>
            <h2 class="mt-2 text-2xl font-bold text-ui-text">Create a new employee profile</h2>
            <p class="mt-2 muted-copy">
              Fill in the employee information below to add a new profile.
            </p>
          </div>
          <a routerLink="/employees" class="btn-secondary">Back to list</a>
        </div>
      </div>

      @if (store.referenceError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Some form options are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.referenceError() }}</p>
          </div>
          <button type="button" class="btn-secondary" (click)="reloadReferenceData()">Retry</button>
        </div>
      }

      <app-employee-form
        [form]="form"
        [mode]="'create'"
        [departments]="store.departments()"
        [positions]="store.positions()"
        [isReferenceLoading]="store.isReferenceLoading()"
        [isSubmitting]="store.isSubmitting()"
        [submitError]="store.submitError()"
        [fieldErrors]="store.formErrors()"
        (submitForm)="submit()"
        (cancelForm)="cancel()"
      />
    </section>
  `,
})
export class EmployeeCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(EmployeesStore);
  protected readonly form = buildEmployeeForm('create');

  constructor() {
    this.store.clearSubmitState();
    void this.store.loadReferenceData();
  }

  protected async submit(): Promise<void> {
    const employee = await this.store.createEmployee(getEmployeeFormValue(this.form));

    if (employee) {
      void this.router.navigate(['/employees']);
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/employees']);
  }

  protected reloadReferenceData(): void {
    void this.store.loadReferenceData(true);
  }
}
