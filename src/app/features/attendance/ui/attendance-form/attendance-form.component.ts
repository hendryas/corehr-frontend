import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AttendanceEmployeeOption,
  AttendanceFormErrors,
  AttendanceFormField,
  AttendanceFormMode,
} from '../../domain/models/attendance.model';
import { AttendanceFormGroup } from './attendance-form.utils';

@Component({
  selector: 'app-attendance-form',
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
          <h2 class="text-xl font-bold text-ui-text">Attendance information</h2>
          <p class="mt-1 muted-copy">Select the employee, attendance date, and the daily attendance status.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
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
            @if (!isReferenceLoading() && employeeOptions().length === 0) {
              <p class="text-xs text-ui-muted">Employee options are not available yet.</p>
            }
            @if (errorFor('userId')) {
              <p class="field-error">{{ errorFor('userId') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="attendanceDate">Attendance date</label>
            <input id="attendanceDate" type="date" class="field-shell" formControlName="attendanceDate" />
            @if (errorFor('attendanceDate')) {
              <p class="field-error">{{ errorFor('attendanceDate') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="status">Status</label>
            <select id="status" class="field-shell" formControlName="status">
              <option value="present">Present</option>
              <option value="sick">Sick</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
            @if (form().controls.status.value === 'present') {
              <p class="text-xs text-ui-muted">
                Present status will be rejected if the employee has approved leave on the selected date.
              </p>
            }
            @if (errorFor('status')) {
              <p class="field-error">{{ errorFor('status') }}</p>
            }
          </div>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Check in and check out</h2>
          <p class="mt-1 muted-copy">Add time details when they are available for the selected attendance record.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="field-label" for="checkInTime">Check in</label>
            <input id="checkInTime" type="time" class="field-shell" formControlName="checkInTime" />
            @if (errorFor('checkInTime')) {
              <p class="field-error">{{ errorFor('checkInTime') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="checkOutTime">Check out</label>
            <input id="checkOutTime" type="time" class="field-shell" formControlName="checkOutTime" />
            @if (errorFor('checkOutTime')) {
              <p class="field-error">{{ errorFor('checkOutTime') }}</p>
            }
          </div>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Notes</h2>
          <p class="mt-1 muted-copy">Add context if the attendance record needs additional explanation.</p>
        </div>

        <div class="mt-5 space-y-2">
          <label class="field-label" for="notes">Notes</label>
          <textarea
            id="notes"
            rows="5"
            class="field-shell min-h-32 resize-y"
            formControlName="notes"
            placeholder="Optional notes for this attendance record"
          ></textarea>
          @if (errorFor('notes')) {
            <p class="field-error">{{ errorFor('notes') }}</p>
          }
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" (click)="cancelForm.emit()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Saving...' : mode() === 'create' ? 'Save attendance' : 'Save changes' }}
        </button>
      </div>
    </form>
  `,
})
export class AttendanceFormComponent {
  readonly form = input.required<AttendanceFormGroup>();
  readonly mode = input.required<AttendanceFormMode>();
  readonly employeeOptions = input.required<AttendanceEmployeeOption[]>();
  readonly isReferenceLoading = input(false);
  readonly isSubmitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly fieldErrors = input<AttendanceFormErrors>({});

  readonly submitForm = output<void>();
  readonly cancelForm = output<void>();

  protected handleSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitForm.emit();
  }

  protected employeeLabel(employee: AttendanceEmployeeOption): string {
    const departmentName = employee.departmentName?.trim();
    return departmentName
      ? `${employee.fullName} - ${employee.employeeCode} - ${departmentName}`
      : `${employee.fullName} - ${employee.employeeCode}`;
  }

  protected errorFor(field: AttendanceFormField): string | null {
    const apiMessages = this.fieldErrors()[field];

    if (apiMessages?.length) {
      return apiMessages[0];
    }

    const control = this.form().controls[field];

    if (field === 'checkOutTime' && this.form().errors?.['timeRange'] && control.touched) {
      return 'Check out time must be later than check in time.';
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
