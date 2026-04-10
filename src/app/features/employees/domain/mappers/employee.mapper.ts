import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../core/models/api.model';
import { getInitials } from '../../../../shared/utils/string.utils';
import {
  DepartmentOption,
  EmployeeApiRecord,
  EmployeeDetail,
  EmployeeFormErrors,
  EmployeeFormValue,
  EmployeeListItem,
  EmployeeRole,
  EmployeeStatusFilter,
  EmployeeUpsertRequest,
  PositionOption,
} from '../models/employee.model';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const fallbackText = 'Not provided';

const validationFieldMap: Record<string, keyof EmployeeFormValue> = {
  employee_code: 'employeeCode',
  full_name: 'fullName',
  email: 'email',
  password: 'password',
  phone: 'phone',
  gender: 'gender',
  address: 'address',
  hire_date: 'hireDate',
  is_active: 'isActive',
  role: 'role',
  department_id: 'departmentId',
  position_id: 'positionId',
};

export function mapEmployeeToListItem(employee: EmployeeApiRecord): EmployeeListItem {
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    departmentName: employee.departmentName ?? 'Unassigned',
    positionName: employee.positionName ?? roleLabel(employee.role),
    hireDate: employee.hireDate,
    hireDateLabel: formatDate(employee.hireDate),
    isActive: employee.isActive,
    statusLabel: statusLabel(employee.isActive),
    role: employee.role,
    roleLabel: roleLabel(employee.role),
  };
}

export function mapEmployeeToDetail(employee: EmployeeApiRecord): EmployeeDetail {
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    phoneLabel: employee.phone || fallbackText,
    gender: employee.gender,
    genderLabel: employee.gender ? titleCase(employee.gender) : fallbackText,
    address: employee.address,
    addressLabel: employee.address || fallbackText,
    hireDate: employee.hireDate,
    hireDateLabel: formatDate(employee.hireDate),
    isActive: employee.isActive,
    statusLabel: statusLabel(employee.isActive),
    role: employee.role,
    roleLabel: roleLabel(employee.role),
    departmentId: employee.departmentId,
    departmentName: employee.departmentName ?? 'Unassigned',
    positionId: employee.positionId,
    positionName: employee.positionName ?? fallbackText,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
    initials: getInitials(employee.fullName),
  };
}

export function mapEmployeeToFormValue(employee: EmployeeApiRecord): EmployeeFormValue {
  return {
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
  };
}

export function mapEmployeeFormToRequest(
  value: EmployeeFormValue,
  mode: 'create' | 'edit',
): EmployeeUpsertRequest {
  const payload: EmployeeUpsertRequest = {
    employee_code: value.employeeCode.trim(),
    full_name: value.fullName.trim(),
    email: value.email.trim().toLowerCase(),
    phone: normalizeOptional(value.phone),
    gender: normalizeOptional(value.gender),
    address: normalizeOptional(value.address),
    hire_date: normalizeOptional(value.hireDate),
    is_active: value.isActive,
    role: value.role,
    department_id: Number(value.departmentId),
    position_id: Number(value.positionId),
  };

  if (mode === 'create' || value.password.trim()) {
    payload.password = value.password.trim();
  }

  return payload;
}

export function mapValidationErrors(
  errors: ApiErrorResponse['errors'] | null | undefined,
): EmployeeFormErrors {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<EmployeeFormErrors>((result, [apiField, messages]) => {
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

export function statusFilterToQuery(status: EmployeeStatusFilter): boolean | null {
  switch (status) {
    case 'active':
      return true;
    case 'inactive':
      return false;
    default:
      return null;
  }
}

export function positionLabel(position: PositionOption): string {
  return `${position.name} · ${position.departmentName}`;
}

export function departmentSubtitle(department: DepartmentOption): string {
  return department.description?.trim() || 'Department option';
}

function formatDate(value: string | null): string {
  if (!value) {
    return fallbackText;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? value : dateFormatter.format(parsedDate);
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function statusLabel(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive';
}

function roleLabel(role: EmployeeRole): string {
  return role === 'admin_hr' ? 'HR Administrator' : 'Employee';
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
