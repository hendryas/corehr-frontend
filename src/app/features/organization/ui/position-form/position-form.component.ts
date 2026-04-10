import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DepartmentListItem,
  PositionFormErrors,
  PositionFormField,
} from '../../domain/models/organization.model';
import { PositionFormGroup } from './position-form.utils';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="grid gap-6" [formGroup]="form()" (ngSubmit)="handleSubmit()">
      @if (submitError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <p class="text-sm font-semibold text-danger">{{ submitError() }}</p>
        </div>
      }

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Position information</h2>
          <p class="mt-1 muted-copy">Assign the position to a department and add the supporting description.</p>
        </div>

        <div class="mt-5 grid gap-5">
          <div class="space-y-2">
            <label class="field-label" for="departmentId">Department</label>
            <select id="departmentId" class="field-shell" formControlName="departmentId">
              <option [ngValue]="null">Select department</option>
              @for (department of departments(); track department.id) {
                <option [ngValue]="department.id">{{ department.name }}</option>
              }
            </select>
            @if (errorFor('departmentId')) {
              <p class="field-error">{{ errorFor('departmentId') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="name">Position name</label>
            <input id="name" type="text" class="field-shell" formControlName="name" placeholder="HR Manager" />
            @if (errorFor('name')) {
              <p class="field-error">{{ errorFor('name') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="description">Description</label>
            <textarea
              id="description"
              rows="5"
              class="field-shell min-h-32 resize-y"
              formControlName="description"
              placeholder="Describe the main responsibility of this position"
            ></textarea>
            @if (errorFor('description')) {
              <p class="field-error">{{ errorFor('description') }}</p>
            }
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" (click)="cancelForm.emit()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Saving...' : submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class PositionFormComponent {
  readonly form = input.required<PositionFormGroup>();
  readonly departments = input.required<DepartmentListItem[]>();
  readonly submitLabel = input('Save position');
  readonly isSubmitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly fieldErrors = input<PositionFormErrors>({});

  readonly submitForm = output<void>();
  readonly cancelForm = output<void>();

  protected handleSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitForm.emit();
  }

  protected errorFor(field: PositionFormField): string | null {
    const apiMessages = this.fieldErrors()[field];

    if (apiMessages?.length) {
      return apiMessages[0];
    }

    const control = this.form().controls[field];

    if (!control.touched || !control.invalid) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    return 'Please review this field.';
  }
}
