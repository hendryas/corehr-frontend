import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { DepartmentFormComponent } from '../../ui/department-form/department-form.component';
import {
  buildDepartmentForm,
  getDepartmentFormValue,
} from '../../ui/department-form/department-form.utils';

@Component({
  selector: 'app-department-edit',
  standalone: true,
  imports: [RouterLink, DepartmentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.departmentDetailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Department details can't be shown right now</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.departmentDetailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/organization/departments" class="btn-secondary">Back to departments</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else {
        <section class="surface-card p-6">
          <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-ui-text">Edit department</h2>
              <p class="mt-1 muted-copy">Update the department details if anything has changed.</p>
            </div>
            <a routerLink="/organization/departments" class="btn-secondary">Back to departments</a>
          </div>
        </section>

        <app-department-form
          [form]="form"
          [submitLabel]="'Save changes'"
          [isSubmitting]="store.isDepartmentSubmitting()"
          [submitError]="store.departmentSubmitError()"
          [fieldErrors]="store.departmentFormErrors()"
          (submitForm)="save()"
          (cancelForm)="goBack()"
        />
      }
    </section>
  `,
})
export class DepartmentEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildDepartmentForm();
  protected readonly departmentId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    if (!this.departmentId) {
      return;
    }

    const department = await this.store.updateDepartment(
      this.departmentId,
      getDepartmentFormValue(this.form),
    );

    if (department) {
      void this.router.navigate(['/organization', 'departments']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'departments']);
  }

  protected async reload(): Promise<void> {
    if (!this.departmentId) {
      return;
    }

    await this.store.loadDepartment(this.departmentId);
    const department = this.store.departmentDetail();

    if (!department) {
      return;
    }

    this.form.patchValue(department);
  }
}
