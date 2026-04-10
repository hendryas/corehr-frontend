import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { DepartmentFormComponent } from '../../ui/department-form/department-form.component';
import {
  buildDepartmentForm,
  getDepartmentFormValue,
} from '../../ui/department-form/department-form.utils';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [RouterLink, DepartmentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <section class="surface-card p-6">
        <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-ui-text">Add department</h2>
            <p class="mt-1 muted-copy">Create a new department used across the organization structure.</p>
          </div>
          <a routerLink="/organization/departments" class="btn-secondary">Back to departments</a>
        </div>
      </section>

      <app-department-form
        [form]="form"
        [submitLabel]="'Create department'"
        [isSubmitting]="store.isDepartmentSubmitting()"
        [submitError]="store.departmentSubmitError()"
        [fieldErrors]="store.departmentFormErrors()"
        (submitForm)="save()"
        (cancelForm)="goBack()"
      />
    </section>
  `,
})
export class DepartmentCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildDepartmentForm();

  protected async save(): Promise<void> {
    const department = await this.store.createDepartment(getDepartmentFormValue(this.form));

    if (department) {
      void this.router.navigate(['/organization', 'departments']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'departments']);
  }
}
