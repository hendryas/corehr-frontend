import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  EmployeeDetail,
  EmployeeFormMode,
  EmployeeFormValue,
  EmployeeRole,
} from '../../domain/models/employee.model';

export type EmployeeFormGroup = FormGroup<{
  employeeCode: FormControl<string>;
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  gender: FormControl<string>;
  address: FormControl<string>;
  hireDate: FormControl<string>;
  isActive: FormControl<boolean>;
  role: FormControl<EmployeeRole>;
  departmentId: FormControl<number | null>;
  positionId: FormControl<number | null>;
}>;

export function buildEmployeeForm(mode: EmployeeFormMode): EmployeeFormGroup {
  return new FormGroup({
    employeeCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators:
        mode === 'create'
          ? [Validators.required, Validators.minLength(8)]
          : [Validators.minLength(8)],
    }),
    phone: new FormControl('', { nonNullable: true }),
    gender: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    hireDate: new FormControl('', { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
    role: new FormControl<EmployeeRole>('employee', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    departmentId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    positionId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });
}

export function patchEmployeeForm(form: EmployeeFormGroup, employee: EmployeeDetail): void {
  form.patchValue({
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    password: '',
    phone: employee.phone ?? '',
    gender: employee.gender ?? '',
    address: employee.address ?? '',
    hireDate: employee.hireDate ?? '',
    isActive: employee.isActive,
    role: employee.role,
    departmentId: employee.departmentId,
    positionId: employee.positionId,
  });
}

export function getEmployeeFormValue(form: EmployeeFormGroup): EmployeeFormValue {
  return form.getRawValue();
}
