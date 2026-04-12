import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import {
  LeaveTypeFormErrors,
  LeaveTypeFormValue,
  LeaveTypeListItem,
  LeaveTypeRecord,
  LeaveTypeUpsertRequest,
} from '../models/leave-type.model';

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const fallbackText = 'No description';

const validationFieldMap: Record<string, keyof LeaveTypeFormValue> = {
  code: 'code',
  name: 'name',
  description: 'description',
};

export function mapLeaveTypeToListItem(leaveType: LeaveTypeRecord): LeaveTypeListItem {
  return {
    id: leaveType.id,
    code: leaveType.code,
    name: leaveType.name,
    description: leaveType.description,
    descriptionLabel: leaveType.description?.trim() || fallbackText,
    updatedAt: leaveType.updatedAt,
    updatedAtLabel: formatDateTime(leaveType.updatedAt),
    statusLabel: 'Active',
  };
}

export function mapLeaveTypeToFormValue(leaveType: LeaveTypeRecord): LeaveTypeFormValue {
  return {
    code: leaveType.code,
    name: leaveType.name,
    description: leaveType.description ?? '',
  };
}

export function mapLeaveTypeFormToRequest(
  value: LeaveTypeFormValue,
): LeaveTypeUpsertRequest {
  return {
    code: value.code.trim().toLowerCase(),
    name: value.name.trim(),
    description: normalizeOptional(value.description),
  };
}

export function mapLeaveTypeValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): LeaveTypeFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<LeaveTypeFormErrors>((result, [apiField, messages]) => {
    const field = validationFieldMap[apiField];

    if (field) {
      result[field] = messages;
    }

    return result;
  }, {});
}

export function getLeaveTypeApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const apiMessage = error.error?.message;

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }
  }

  return fallback;
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? value : dateTimeFormatter.format(parsedDate);
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}
