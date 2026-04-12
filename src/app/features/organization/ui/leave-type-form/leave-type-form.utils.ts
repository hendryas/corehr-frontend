import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LeaveTypeFormValue } from '../../../leave/domain/models/leave-type.model';

const leaveTypeCodePattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export type LeaveTypeFormGroup = FormGroup<{
  code: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
}>;

export function buildLeaveTypeForm(): LeaveTypeFormGroup {
  return new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(leaveTypeCodePattern)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', { nonNullable: true }),
  });
}

export function patchLeaveTypeForm(
  form: LeaveTypeFormGroup,
  value: LeaveTypeFormValue,
): void {
  form.patchValue(value);
}

export function getLeaveTypeFormValue(form: LeaveTypeFormGroup): LeaveTypeFormValue {
  return form.getRawValue();
}
