import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { LeaveDetail, LeaveFormValue } from '../../domain/models/leave.model';
import { LeaveTypeRecord } from '../../domain/models/leave-type.model';

export type LeaveFormGroup = FormGroup<{
  userId: FormControl<number | null>;
  leaveTypeId: FormControl<number | null>;
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
      leaveTypeId: new FormControl<number | null>(null, {
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
    leaveTypeId: leave.leaveTypeId,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason,
  });
}

export function getLeaveFormValue(form: LeaveFormGroup): LeaveFormValue {
  return form.getRawValue();
}

export function syncLeaveTypeAvailability(
  form: LeaveFormGroup,
  leaveTypes: readonly LeaveTypeRecord[],
): void {
  const control = form.controls.leaveTypeId;
  const leaveTypeId = control.value;

  if (!leaveTypeId) {
    const { unavailableLeaveType, ...rest } = control.errors ?? {};
    control.setErrors(Object.keys(rest).length > 0 ? rest : null);
    return;
  }

  const leaveTypeExists = leaveTypes.some((leaveType) => leaveType.id === leaveTypeId);

  if (leaveTypeExists) {
    const { unavailableLeaveType, ...rest } = control.errors ?? {};
    control.setErrors(Object.keys(rest).length > 0 ? rest : null);
    return;
  }

  control.setErrors({
    ...(control.errors ?? {}),
    unavailableLeaveType: true,
  });
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
