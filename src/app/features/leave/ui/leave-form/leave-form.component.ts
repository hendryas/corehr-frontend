import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  LeaveEmployeeOption,
  LeaveFormErrors,
  LeaveFormField,
  LeaveFormMode,
} from '../../domain/models/leave.model';
import { LeaveFormGroup } from './leave-form.utils';

@Component({
  selector: 'app-leave-form',
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
          <h2 class="text-xl font-bold text-ui-text">Leave request information</h2>
          <p class="mt-1 muted-copy">Choose the employee and complete the leave request details.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          @if (showEmployeeField()) {
            <div class="space-y-2 md:col-span-2">
              <label class="field-label" for="userId">Employee</label>
              <select
                id="userId"
                class="field-shell"
                formControlName="userId"
                [disabled]="isReferenceLoading() || employeeOptions().length === 0"
              >
                <option [ngValue]="null">Select employee</option>
                @for (employee of employeeOptions(); track employee.id) {
                  <option [ngValue]="employee.id">{{ employeeLabel(employee) }}</option>
                }
              </select>
              @if (errorFor('userId')) {
                <p class="field-error">{{ errorFor('userId') }}</p>
              }
            </div>
          } @else if (selectedEmployeeLabel()) {
            <div class="rounded-[24px] border border-ui-border bg-ui-bg/70 px-4 py-4 md:col-span-2">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Employee</p>
              <p class="mt-2 text-sm font-semibold text-ui-text">{{ selectedEmployeeLabel() }}</p>
            </div>
          }

          <div class="space-y-2">
            <label class="field-label" for="leaveType">Leave type</label>
            <input
              id="leaveType"
              type="text"
              class="field-shell"
              formControlName="leaveType"
              placeholder="Annual Leave"
              [attr.list]="leaveTypeOptions().length ? 'leave-type-options' : null"
            />
            @if (leaveTypeOptions().length) {
              <datalist id="leave-type-options">
                @for (leaveType of leaveTypeOptions(); track leaveType) {
                  <option [value]="leaveType"></option>
                }
              </datalist>
            }
            @if (errorFor('leaveType')) {
              <p class="field-error">{{ errorFor('leaveType') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="startDate">Start date</label>
            <input id="startDate" type="date" class="field-shell" formControlName="startDate" />
            @if (errorFor('startDate')) {
              <p class="field-error">{{ errorFor('startDate') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="endDate">End date</label>
            <input id="endDate" type="date" class="field-shell" formControlName="endDate" />
            @if (errorFor('endDate')) {
              <p class="field-error">{{ errorFor('endDate') }}</p>
            }
          </div>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Reason</h2>
          <p class="mt-1 muted-copy">Explain the leave request so the team can review it clearly.</p>
        </div>

        <div class="mt-5 space-y-2">
          <label class="field-label" for="reason">Reason</label>
          <textarea
            id="reason"
            rows="6"
            class="field-shell min-h-36 resize-y"
            formControlName="reason"
            placeholder="Add the main reason for this leave request"
          ></textarea>
          @if (errorFor('reason')) {
            <p class="field-error">{{ errorFor('reason') }}</p>
          }
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" (click)="cancelForm.emit()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Saving...' : mode() === 'create' ? 'Submit request' : 'Save changes' }}
        </button>
      </div>
    </form>
  `,
})
export class LeaveFormComponent {
  readonly form = input.required<LeaveFormGroup>();
  readonly mode = input.required<LeaveFormMode>();
  readonly employeeOptions = input.required<LeaveEmployeeOption[]>();
  readonly leaveTypeOptions = input<string[]>([]);
  readonly showEmployeeField = input(false);
  readonly selectedEmployeeLabel = input('');
  readonly isReferenceLoading = input(false);
  readonly isSubmitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly fieldErrors = input<LeaveFormErrors>({});

  readonly submitForm = output<void>();
  readonly cancelForm = output<void>();

  protected handleSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitForm.emit();
  }

  protected employeeLabel(employee: LeaveEmployeeOption): string {
    const departmentName = employee.departmentName?.trim();

    return departmentName
      ? `${employee.fullName} - ${employee.employeeCode} - ${departmentName}`
      : `${employee.fullName} - ${employee.employeeCode}`;
  }

  protected errorFor(field: LeaveFormField): string | null {
    const apiMessages = this.fieldErrors()[field];

    if (apiMessages?.length) {
      return apiMessages[0];
    }

    const control = this.form().controls[field];

    if (field === 'endDate' && this.form().errors?.['dateRange'] && control.touched) {
      return 'End date must be later than or equal to start date.';
    }

    if (!control.touched || !control.invalid) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    return 'Please review this field.';
  }
}
