import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentFormValue } from '../../domain/models/organization.model';

export type DepartmentFormGroup = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
}>;

export function buildDepartmentForm(): DepartmentFormGroup {
  return new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', { nonNullable: true }),
  });
}

export function getDepartmentFormValue(form: DepartmentFormGroup): DepartmentFormValue {
  return form.getRawValue();
}
