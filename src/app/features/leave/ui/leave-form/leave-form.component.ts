import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  LeaveEmployeeOption,
  LeaveFormErrors,
  LeaveFormField,
  LeaveFormMode,
} from '../../domain/models/leave.model';
import { LeaveTypeRecord } from '../../domain/models/leave-type.model';
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
          <p class="mt-1 muted-copy">Choose the employee and fill in the leave details.</p>
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
            <label class="field-label" for="leaveTypeId">Leave type</label>
            <select
              id="leaveTypeId"
              class="field-shell"
              formControlName="leaveTypeId"
              [disabled]="isReferenceLoading() || leaveTypes().length === 0"
            >
              <option [ngValue]="null">Select leave type</option>
              @for (leaveType of leaveTypes(); track leaveType.id) {
                <option [ngValue]="leaveType.id">{{ leaveType.name }}</option>
              }
            </select>
            @if (leaveTypeMessage()) {
              <p class="text-xs font-medium text-ui-muted">{{ leaveTypeMessage() }}</p>
            }
            @if (errorFor('leaveTypeId')) {
              <p class="field-error">{{ errorFor('leaveTypeId') }}</p>
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
          <p class="mt-1 muted-copy">Share the reason for this leave request.</p>
        </div>

        <div class="mt-5 space-y-2">
          <label class="field-label" for="reason">Reason</label>
          <textarea
            id="reason"
            rows="6"
            class="field-shell min-h-36 resize-y"
            formControlName="reason"
            placeholder="Add the reason for this leave"
          ></textarea>
          @if (errorFor('reason')) {
            <p class="field-error">{{ errorFor('reason') }}</p>
          }
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" (click)="cancelForm.emit()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="isSubmitting() || disableSubmit()">
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
  readonly leaveTypes = input<readonly LeaveTypeRecord[]>([]);
  readonly showEmployeeField = input(false);
  readonly selectedEmployeeLabel = input('');
  readonly leaveTypeMessage = input<string | null>(null);
  readonly isReferenceLoading = input(false);
  readonly isSubmitting = input(false);
  readonly disableSubmit = input(false);
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

    if (control.errors?.['unavailableLeaveType']) {
      return 'This leave type is no longer available. Please choose another leave type.';
    }

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    return 'Please review this field.';
  }
}
