import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import {
  DepartmentApiRecord,
  DepartmentFormErrors,
  DepartmentFormValue,
  DepartmentListItem,
  DepartmentUpsertRequest,
  PositionApiRecord,
  PositionFormErrors,
  PositionFormValue,
  PositionListItem,
  PositionUpsertRequest,
} from '../models/organization.model';

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const fallbackText = 'No description';

const departmentValidationFieldMap: Record<string, keyof DepartmentFormValue> = {
  name: 'name',
  description: 'description',
};

const positionValidationFieldMap: Record<string, keyof PositionFormValue> = {
  department_id: 'departmentId',
  name: 'name',
  description: 'description',
};

export function mapDepartmentToListItem(department: DepartmentApiRecord): DepartmentListItem {
  return {
    id: department.id,
    name: department.name,
    description: department.description,
    descriptionLabel: department.description?.trim() || fallbackText,
    isActive: true,
    statusLabel: 'Active',
    updatedAt: department.updatedAt,
    updatedAtLabel: formatDateTime(department.updatedAt),
  };
}

export function mapPositionToListItem(position: PositionApiRecord): PositionListItem {
  return {
    id: position.id,
    departmentId: position.departmentId,
    departmentName: position.departmentName,
    name: position.name,
    description: position.description,
    descriptionLabel: position.description?.trim() || fallbackText,
    isActive: true,
    statusLabel: 'Active',
    updatedAt: position.updatedAt,
    updatedAtLabel: formatDateTime(position.updatedAt),
  };
}

export function mapDepartmentToFormValue(
  department: DepartmentApiRecord,
): DepartmentFormValue {
  return {
    name: department.name,
    description: department.description ?? '',
  };
}

export function mapPositionToFormValue(position: PositionApiRecord): PositionFormValue {
  return {
    departmentId: position.departmentId,
    name: position.name,
    description: position.description ?? '',
  };
}

export function mapDepartmentFormToRequest(
  value: DepartmentFormValue,
): DepartmentUpsertRequest {
  return {
    name: value.name.trim(),
    description: normalizeOptional(value.description),
  };
}

export function mapPositionFormToRequest(value: PositionFormValue): PositionUpsertRequest {
  return {
    department_id: Number(value.departmentId),
    name: value.name.trim(),
    description: normalizeOptional(value.description),
  };
}

export function mapDepartmentValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): DepartmentFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<DepartmentFormErrors>((result, [apiField, messages]) => {
    const field = departmentValidationFieldMap[apiField];

    if (field) {
      result[field] = messages;
    }

    return result;
  }, {});
}

export function mapPositionValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): PositionFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<PositionFormErrors>((result, [apiField, messages]) => {
    const field = positionValidationFieldMap[apiField];

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

function formatDateTime(value: string): string {
  const parsedDate = new Date(value.trim().replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? value : dateTimeFormatter.format(parsedDate);
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}
