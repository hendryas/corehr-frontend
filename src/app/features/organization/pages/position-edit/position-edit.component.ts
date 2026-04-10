import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';
import { PositionFormComponent } from '../../ui/position-form/position-form.component';
import {
  buildPositionForm,
  getPositionFormValue,
} from '../../ui/position-form/position-form.utils';

@Component({
  selector: 'app-position-edit',
  standalone: true,
  imports: [RouterLink, PositionFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.positionDetailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Position detail could not be loaded</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.positionDetailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/organization/positions" class="btn-secondary">Back to positions</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else {
        <section class="surface-card p-6">
          <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-ui-text">Edit position</h2>
              <p class="mt-1 muted-copy">Update the position details and department assignment as needed.</p>
            </div>
            <a routerLink="/organization/positions" class="btn-secondary">Back to positions</a>
          </div>
        </section>

        <app-position-form
          [form]="form"
          [departments]="store.departments()"
          [submitLabel]="'Save changes'"
          [isSubmitting]="store.isPositionSubmitting()"
          [submitError]="store.positionSubmitError()"
          [fieldErrors]="store.positionFormErrors()"
          (submitForm)="save()"
          (cancelForm)="goBack()"
        />
      }
    </section>
  `,
})
export class PositionEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(OrganizationStore);
  protected readonly form = buildPositionForm();
  protected readonly positionId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    if (!this.positionId) {
      return;
    }

    const position = await this.store.updatePosition(
      this.positionId,
      getPositionFormValue(this.form),
    );

    if (position) {
      void this.router.navigate(['/organization', 'positions']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/organization', 'positions']);
  }

  protected async reload(): Promise<void> {
    if (!this.positionId) {
      return;
    }

    await Promise.all([this.store.loadDepartments(), this.store.loadPosition(this.positionId)]);
    const position = this.store.positionDetail();

    if (!position) {
      return;
    }

    this.form.patchValue(position);
  }
}
