import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { LeaveDetail, LeaveFormValue } from '../../domain/models/leave.model';

export type LeaveFormGroup = FormGroup<{
  userId: FormControl<number | null>;
  leaveType: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  reason: FormControl<string>;
}>;

export function buildLeaveForm(): LeaveFormGroup {
  return new FormGroup(
    {
      userId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      leaveType: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      startDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      reason: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [dateRangeValidator],
    },
  );
}

export function patchLeaveForm(form: LeaveFormGroup, leave: LeaveDetail): void {
  form.patchValue({
    userId: leave.userId,
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason,
  });
}

export function getLeaveFormValue(form: LeaveFormGroup): LeaveFormValue {
  return form.getRawValue();
}

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const group = control as LeaveFormGroup;
  const startDate = group.controls.startDate.value;
  const endDate = group.controls.endDate.value;

  if (!startDate || !endDate) {
    return null;
  }

  return startDate > endDate ? { dateRange: true } : null;
}
