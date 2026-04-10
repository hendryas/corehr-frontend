import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import { AuthenticatedUser } from '../../../../core/models/auth.model';
import { getInitials } from '../../../../shared/utils/string.utils';
import {
  LeaveApiRecord,
  LeaveDetail,
  LeaveEmployeeOption,
  LeaveFormErrors,
  LeaveFormValue,
  LeaveListItem,
  LeaveRequestStatus,
  LeaveRequestStatusFilter,
  LeaveUpsertRequest,
} from '../models/leave.model';

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

const fallbackText = 'Not provided';

const validationFieldMap: Record<string, keyof LeaveFormValue> = {
  user_id: 'userId',
  leave_type: 'leaveType',
  start_date: 'startDate',
  end_date: 'endDate',
  reason: 'reason',
};

export function mapAuthenticatedUserToLeaveOption(
  user: AuthenticatedUser,
): LeaveEmployeeOption {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    departmentName: user.departmentName,
    positionName: user.positionName,
    isActive: user.isActive,
  };
}

export function mapLeaveToListItem(
  leave: LeaveApiRecord,
  employeeLookup: Map<number, LeaveEmployeeOption>,
): LeaveListItem {
  const employee = employeeLookup.get(leave.userId);
  const totalDays = calculateTotalDays(leave.startDate, leave.endDate);

  return {
    id: leave.id,
    userId: leave.userId,
    employeeCode: leave.employeeCode,
    fullName: leave.fullName,
    departmentName: employee?.departmentName ?? 'Not assigned',
    positionName: employee?.positionName ?? 'Not assigned',
    leaveType: leave.leaveType,
    requestDate: leave.createdAt,
    requestDateLabel: formatDateTime(leave.createdAt),
    startDate: leave.startDate,
    startDateLabel: formatDate(leave.startDate),
    endDate: leave.endDate,
    endDateLabel: formatDate(leave.endDate),
    totalDays,
    totalDaysLabel: `${totalDays} day${totalDays === 1 ? '' : 's'}`,
    status: leave.status,
    statusLabel: statusLabel(leave.status),
    reason: leave.reason,
    reasonLabel: leave.reason.trim(),
  };
}

export function mapLeaveToDetail(
  leave: LeaveApiRecord,
  employeeLookup: Map<number, LeaveEmployeeOption>,
): LeaveDetail {
  const listItem = mapLeaveToListItem(leave, employeeLookup);

  return {
    ...listItem,
    approverName: leave.approverName,
    approverNameLabel: leave.approverName?.trim() || fallbackText,
    approvedAt: leave.approvedAt,
    approvedAtLabel: formatDateTime(leave.approvedAt),
    rejectionReason: leave.rejectionReason,
    rejectionReasonLabel: leave.rejectionReason?.trim() || fallbackText,
    createdAt: leave.createdAt,
    createdAtLabel: formatDateTime(leave.createdAt),
    updatedAt: leave.updatedAt,
    updatedAtLabel: formatDateTime(leave.updatedAt),
    initials: getInitials(leave.fullName),
  };
}

export function mapLeaveToFormValue(leave: LeaveApiRecord): LeaveFormValue {
  return {
    userId: leave.userId,
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason,
  };
}

export function mapLeaveFormToRequest(
  value: LeaveFormValue,
  isAdmin: boolean,
): LeaveUpsertRequest {
  const payload: LeaveUpsertRequest = {
    leave_type: value.leaveType.trim(),
    start_date: value.startDate,
    end_date: value.endDate,
    reason: value.reason.trim(),
  };

  if (isAdmin && value.userId) {
    payload.user_id = Number(value.userId);
  }

  return payload;
}

export function mapValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): LeaveFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<LeaveFormErrors>((result, [apiField, messages]) => {
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

export function statusFilterToQuery(
  status: LeaveRequestStatusFilter,
): LeaveRequestStatus | null {
  return status === 'all' ? null : status;
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

  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? value : dateTimeFormatter.format(parsedDate);
}

function calculateTotalDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / 86400000) + 1;
}

function statusLabel(status: LeaveRequestStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending';
  }
}
