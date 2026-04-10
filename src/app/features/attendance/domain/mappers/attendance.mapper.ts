import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import { getInitials } from '../../../../shared/utils/string.utils';
import {
  AttendanceApiRecord,
  AttendanceDetail,
  AttendanceEmployeeOption,
  AttendanceFormErrors,
  AttendanceFormValue,
  AttendanceListItem,
  AttendanceStatus,
  AttendanceStatusFilter,
  AttendanceUpsertRequest,
} from '../models/attendance.model';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const fallbackText = 'Not provided';

const validationFieldMap: Record<string, keyof AttendanceFormValue> = {
  user_id: 'userId',
  attendance_date: 'attendanceDate',
  check_in: 'checkInTime',
  check_out: 'checkOutTime',
  status: 'status',
  notes: 'notes',
};

export function mapAttendanceToListItem(
  attendance: AttendanceApiRecord,
  employeeLookup: Map<number, AttendanceEmployeeOption>,
): AttendanceListItem {
  const employee = employeeLookup.get(attendance.userId);

  return {
    id: attendance.id,
    userId: attendance.userId,
    employeeCode: attendance.employeeCode,
    fullName: attendance.fullName,
    departmentName: employee?.departmentName ?? 'Not assigned',
    positionName: employee?.positionName ?? roleLabel(attendance.role),
    attendanceDate: attendance.attendanceDate,
    attendanceDateLabel: formatDate(attendance.attendanceDate),
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    checkInLabel: formatTime(attendance.checkIn),
    checkOutLabel: formatTime(attendance.checkOut),
    status: attendance.status,
    statusLabel: statusLabel(attendance.status),
    notes: attendance.notes,
    notesLabel: attendance.notes?.trim() || 'No notes',
  };
}

export function mapAttendanceToDetail(
  attendance: AttendanceApiRecord,
  employeeLookup: Map<number, AttendanceEmployeeOption>,
): AttendanceDetail {
  const listItem = mapAttendanceToListItem(attendance, employeeLookup);

  return {
    ...listItem,
    roleLabel: roleLabel(attendance.role),
    createdAt: attendance.createdAt,
    createdAtLabel: formatDateTime(attendance.createdAt),
    updatedAt: attendance.updatedAt,
    updatedAtLabel: formatDateTime(attendance.updatedAt),
    initials: getInitials(attendance.fullName),
  };
}

export function mapAttendanceToFormValue(attendance: AttendanceApiRecord): AttendanceFormValue {
  return {
    userId: attendance.userId,
    attendanceDate: attendance.attendanceDate,
    checkInTime: toTimeInput(attendance.checkIn),
    checkOutTime: toTimeInput(attendance.checkOut),
    status: attendance.status,
    notes: attendance.notes ?? '',
  };
}

export function mapAttendanceFormToRequest(value: AttendanceFormValue): AttendanceUpsertRequest {
  return {
    user_id: Number(value.userId),
    attendance_date: value.attendanceDate,
    check_in: combineDateAndTime(value.attendanceDate, value.checkInTime),
    check_out: combineDateAndTime(value.attendanceDate, value.checkOutTime),
    status: value.status,
    notes: normalizeOptional(value.notes),
  };
}

export function mapValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): AttendanceFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<AttendanceFormErrors>((result, [apiField, messages]) => {
    const field = validationFieldMap[apiField];

    if (field) {
      result[field] = messages;
    }

    return result;
  }, {});
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const apiMessage = error.error?.message;

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }
  }

  return fallback;
}

export function statusFilterToQuery(status: AttendanceStatusFilter): AttendanceStatus | null {
  return status === 'all' ? null : status;
}

function combineDateAndTime(date: string, time: string): string | null {
  const normalizedTime = time.trim();

  if (!date || !normalizedTime) {
    return null;
  }

  return `${date} ${normalizedTime}:00`;
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function formatDate(value: string | null): string {
  if (!value) {
    return fallbackText;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : dateFormatter.format(parsedDate);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return fallbackText;
  }

  const parsedDate = parseDateTime(value);
  return Number.isNaN(parsedDate.getTime()) ? value : dateTimeFormatter.format(parsedDate);
}

function formatTime(value: string | null): string {
  if (!value) {
    return fallbackText;
  }

  const parsedDate = parseDateTime(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return timeFormatter.format(parsedDate);
  }

  const matchedTime = value.match(/(\d{2}:\d{2})/);
  return matchedTime ? matchedTime[1] : value;
}

function toTimeInput(value: string | null): string {
  if (!value) {
    return '';
  }

  const matchedTime = value.match(/(\d{2}:\d{2})/);
  return matchedTime ? matchedTime[1] : '';
}

function parseDateTime(value: string): Date {
  return new Date(value.trim().replace(' ', 'T'));
}

function statusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'Present';
    case 'sick':
      return 'Sick';
    case 'leave':
      return 'Leave';
    default:
      return 'Absent';
  }
}

function roleLabel(role: AttendanceApiRecord['role']): string {
  return role === 'admin_hr' ? 'HR Administrator' : 'Employee';
}
