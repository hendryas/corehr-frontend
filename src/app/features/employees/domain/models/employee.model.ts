export type EmployeeRole = 'admin_hr' | 'employee';

export type EmployeeStatusFilter = 'all' | 'active' | 'inactive';

export type EmployeeFormMode = 'create' | 'edit';

export interface EmployeeApiRecord {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  hireDate: string | null;
  isActive: boolean;
  role: EmployeeRole;
  departmentId: number | null;
  departmentName: string | null;
  positionId: number | null;
  positionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeesListResponse {
  items: EmployeeApiRecord[];
  pagination: EmployeesPagination;
}

export interface EmployeeListQuery {
  search: string;
  status: EmployeeStatusFilter;
  page: number;
  limit: number;
}

export interface DepartmentOption {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PositionOption {
  id: number;
  departmentId: number;
  departmentName: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  hireDate: string | null;
  hireDateLabel: string;
  isActive: boolean;
  statusLabel: string;
  role: EmployeeRole;
  roleLabel: string;
}

export interface EmployeeDetail {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  phoneLabel: string;
  gender: string | null;
  genderLabel: string;
  address: string | null;
  addressLabel: string;
  hireDate: string | null;
  hireDateLabel: string;
  isActive: boolean;
  statusLabel: string;
  role: EmployeeRole;
  roleLabel: string;
  departmentId: number | null;
  departmentName: string;
  positionId: number | null;
  positionName: string;
  createdAt: string;
  updatedAt: string;
  initials: string;
}

export interface EmployeeFormValue {
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  address: string;
  hireDate: string;
  isActive: boolean;
  role: EmployeeRole;
  departmentId: number | null;
  positionId: number | null;
}

export type EmployeeFormField = keyof EmployeeFormValue;

export type EmployeeFormErrors = Partial<Record<EmployeeFormField, string[]>>;

export interface EmployeeUpsertRequest {
  employee_code: string;
  full_name: string;
  email: string;
  password?: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  hire_date: string | null;
  is_active: boolean;
  role: EmployeeRole;
  department_id: number;
  position_id: number;
}

export interface EmployeeSectionItem {
  label: string;
  value: string;
}
