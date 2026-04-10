import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeesStore } from '../../state/employees.store';
import { EmployeeFormComponent } from '../../ui/employee-form/employee-form.component';
import {
  buildEmployeeForm,
  getEmployeeFormValue,
  patchEmployeeForm,
} from '../../ui/employee-form/employee-form.utils';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [RouterLink, EmployeeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Employee information is unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/employees" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="initialize()">Retry</button>
          </div>
        </div>
      } @else if (isPreparing()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-8 w-72 rounded-full bg-slate-200"></div>
            <div class="h-24 rounded-[28px] bg-slate-100"></div>
            <div class="h-96 rounded-[28px] bg-slate-100"></div>
          </div>
        </section>
      } @else if (store.detail(); as employee) {
        <div class="surface-card p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Employee update</p>
              <h2 class="mt-2 text-2xl font-bold text-ui-text">Edit {{ employee.fullName }}</h2>
              <p class="mt-2 muted-copy">
                Update the employee information below as needed.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <a [routerLink]="['/employees', employee.id]" class="btn-secondary">Back to detail</a>
              <a routerLink="/employees" class="btn-secondary">Back to list</a>
            </div>
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
          mode="edit"
          [departments]="store.departments()"
          [positions]="store.positions()"
          [isReferenceLoading]="store.isReferenceLoading()"
          [isSubmitting]="store.isSubmitting()"
          [submitError]="store.submitError()"
          [fieldErrors]="store.formErrors()"
          (submitForm)="submit()"
          (cancelForm)="cancel()"
        />
      }
    </section>
  `,
})
export class EmployeeEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(EmployeesStore);
  protected readonly form = buildEmployeeForm('edit');

  protected readonly isPreparing = computed(() => {
    const missingDetail = !this.store.detail();
    return missingDetail && (this.store.isDetailLoading() || this.store.isReferenceLoading());
  });

  constructor() {
    void this.initialize();
  }

  protected async initialize(): Promise<void> {
    this.store.clearSubmitState();

    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    await Promise.all([this.store.loadReferenceData(), this.store.loadEmployee(id)]);

    const employee = this.store.detail();

    if (employee) {
      patchEmployeeForm(this.form, employee);
    }
  }

  protected async submit(): Promise<void> {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    const employee = await this.store.updateEmployee(id, getEmployeeFormValue(this.form));

    if (employee) {
      void this.router.navigate(['/employees', id]);
    }
  }

  protected cancel(): void {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    void this.router.navigate(['/employees', id]);
  }

  protected reloadReferenceData(): void {
    void this.store.loadReferenceData(true);
  }
}
