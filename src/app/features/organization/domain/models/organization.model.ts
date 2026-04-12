export interface DepartmentApiRecord {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PositionApiRecord {
  id: number;
  departmentId: number;
  departmentName: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListFilters {
  search: string;
}

export interface PositionListFilters {
  search: string;
  departmentId: number | 'all';
}

export interface LeaveTypeListFilters {
  search: string;
}

export interface DepartmentListItem {
  id: number;
  name: string;
  description: string | null;
  descriptionLabel: string;
  isActive: boolean;
  statusLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface PositionListItem {
  id: number;
  departmentId: number;
  departmentName: string;
  name: string;
  description: string | null;
  descriptionLabel: string;
  isActive: boolean;
  statusLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface OrganizationSummary {
  totalDepartments: number;
  activeDepartments: number;
  totalPositions: number;
  activePositions: number;
}

export interface DepartmentFormValue {
  name: string;
  description: string;
}

export type DepartmentFormField = keyof DepartmentFormValue;

export type DepartmentFormErrors = Partial<Record<DepartmentFormField, string[]>>;

export interface PositionFormValue {
  departmentId: number | null;
  name: string;
  description: string;
}

export type PositionFormField = keyof PositionFormValue;

export type PositionFormErrors = Partial<Record<PositionFormField, string[]>>;

export interface DepartmentUpsertRequest {
  name: string;
  description: string | null;
}

export interface PositionUpsertRequest {
  department_id: number;
  name: string;
  description: string | null;
}
