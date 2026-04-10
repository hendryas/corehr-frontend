import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import {
  AttendanceDetail,
  AttendanceFormValue,
  AttendanceStatus,
} from '../../domain/models/attendance.model';

export type AttendanceFormGroup = FormGroup<{
  userId: FormControl<number | null>;
  attendanceDate: FormControl<string>;
  checkInTime: FormControl<string>;
  checkOutTime: FormControl<string>;
  status: FormControl<AttendanceStatus>;
  notes: FormControl<string>;
}>;

export function buildAttendanceForm(): AttendanceFormGroup {
  return new FormGroup(
    {
      userId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      attendanceDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      checkInTime: new FormControl('', { nonNullable: true }),
      checkOutTime: new FormControl('', { nonNullable: true }),
      status: new FormControl<AttendanceStatus>('present', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      notes: new FormControl('', { nonNullable: true }),
    },
    {
      validators: [timeRangeValidator],
    },
  );
}

export function patchAttendanceForm(form: AttendanceFormGroup, attendance: AttendanceDetail): void {
  form.patchValue({
    userId: attendance.userId,
    attendanceDate: attendance.attendanceDate,
    checkInTime: toTimeInput(attendance.checkIn),
    checkOutTime: toTimeInput(attendance.checkOut),
    status: attendance.status,
    notes: attendance.notes ?? '',
  });
}

export function getAttendanceFormValue(form: AttendanceFormGroup): AttendanceFormValue {
  return form.getRawValue();
}

function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const group = control as AttendanceFormGroup;
  const attendanceDate = group.controls.attendanceDate.value;
  const checkInTime = group.controls.checkInTime.value;
  const checkOutTime = group.controls.checkOutTime.value;

  if (!attendanceDate || !checkInTime || !checkOutTime) {
    return null;
  }

  const checkInDate = new Date(`${attendanceDate}T${checkInTime}:00`);
  const checkOutDate = new Date(`${attendanceDate}T${checkOutTime}:00`);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return null;
  }

  return checkOutDate < checkInDate ? { timeRange: true } : null;
}

function toTimeInput(value: string | null): string {
  if (!value) {
    return '';
  }

  const matchedTime = value.match(/(\d{2}:\d{2})/);
  return matchedTime ? matchedTime[1] : '';
}
