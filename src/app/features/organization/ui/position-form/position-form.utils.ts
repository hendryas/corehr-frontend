import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PositionFormValue } from '../../domain/models/organization.model';

export type PositionFormGroup = FormGroup<{
  departmentId: FormControl<number | null>;
  name: FormControl<string>;
  description: FormControl<string>;
}>;

export function buildPositionForm(): PositionFormGroup {
  return new FormGroup({
    departmentId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', { nonNullable: true }),
  });
}

export function getPositionFormValue(form: PositionFormGroup): PositionFormValue {
  return form.getRawValue();
}
