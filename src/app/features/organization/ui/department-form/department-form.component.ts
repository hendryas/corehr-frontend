import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DepartmentFormErrors,
  DepartmentFormField,
} from '../../domain/models/organization.model';
import { DepartmentFormGroup } from './department-form.utils';

@Component({
  selector: 'app-department-form',
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
          <h2 class="text-xl font-bold text-ui-text">Department information</h2>
          <p class="mt-1 muted-copy">Add the main details for this department.</p>
        </div>

        <div class="mt-5 grid gap-5">
          <div class="space-y-2">
            <label class="field-label" for="name">Department name</label>
            <input id="name" type="text" class="field-shell" formControlName="name" placeholder="Human Resources" />
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
              placeholder="Describe the purpose of this department"
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
export class DepartmentFormComponent {
  readonly form = input.required<DepartmentFormGroup>();
  readonly submitLabel = input('Save department');
  readonly isSubmitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly fieldErrors = input<DepartmentFormErrors>({});

  readonly submitForm = output<void>();
  readonly cancelForm = output<void>();

  protected handleSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitForm.emit();
  }

  protected errorFor(field: DepartmentFormField): string | null {
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
