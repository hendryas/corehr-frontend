import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { PositionFormComponent } from '../../ui/position-form/position-form.component';
import {
  buildPositionForm,
  getPositionFormValue,
} from '../../ui/position-form/position-form.utils';

@Component({
  selector: 'app-position-create',
  standalone: true,
  imports: [RouterLink, PositionFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <section class="surface-card p-6">
        <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-ui-text">Add position</h2>
            <p class="mt-1 muted-copy">Create a new position and assign it to the correct department.</p>
          </div>
          <a routerLink="/organization/positions" class="btn-secondary">Back to positions</a>
        </div>
      </section>

      <app-position-form
        [form]="form"
        [departments]="store.departments()"
        [submitLabel]="'Create position'"
        [isSubmitting]="store.isPositionSubmitting()"
        [submitError]="store.positionSubmitError()"
        [fieldErrors]="store.positionFormErrors()"
        (submitForm)="save()"
        (cancelForm)="goBack()"
      />
    </section>
  `,
})
export class PositionCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildPositionForm();

  constructor() {
    void this.store.loadDepartments();
  }

  protected async save(): Promise<void> {
    const position = await this.store.createPosition(getPositionFormValue(this.form));

    if (position) {
      void this.router.navigate(['/organization', 'positions']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'positions']);
  }
}
