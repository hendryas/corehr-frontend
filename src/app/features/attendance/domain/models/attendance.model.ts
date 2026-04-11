import { UserRole } from '../../../../core/models/auth.model';

export type AttendanceStatus = 'present' | 'sick' | 'leave' | 'absent';

export type AttendanceStatusFilter = 'all' | AttendanceStatus;

export type AttendanceFormMode = 'create' | 'edit';

export interface AttendanceApiRecord {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  role: UserRole;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AttendancesListResponse {
  items: AttendanceApiRecord[];
  pagination: AttendancePagination;
}

export interface AttendanceListQuery {
  search: string;
  status: AttendanceStatusFilter;
  attendanceDate: string;
  page: number;
  limit: number;
}

export interface AttendanceEmployeeOption {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentName: string | null;
  positionName: string | null;
  isActive: boolean;
}

export interface AttendanceEmployeeListResponse {
  items: AttendanceEmployeeOption[];
  pagination: AttendancePagination;
}

export interface AttendanceListItem {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  departmentName: string;
  positionName: string;
  attendanceDate: string;
  attendanceDateLabel: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLabel: string;
  checkOutLabel: string;
  status: AttendanceStatus;
  statusLabel: string;
  notes: string | null;
  notesLabel: string;
}

export interface AttendanceDetail extends AttendanceListItem {
  roleLabel: string;
  createdAt: string;
  createdAtLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
  initials: string;
}

export interface AttendanceFormValue {
  userId: number | null;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: AttendanceStatus;
  notes: string;
}

export type AttendanceFormField = keyof AttendanceFormValue;

export type AttendanceFormErrors = Partial<Record<AttendanceFormField, string[]>>;

export interface AttendanceUpsertRequest {
  user_id: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
}

export interface AttendanceSectionItem {
  label: string;
  value: string;
}

export interface AttendanceSummary {
  totalRecords: number;
  presentToday: number;
  sickToday: number;
  absentToday: number;
}

export type DailyAttendanceAction = 'check-in' | 'check-out' | 'completed' | 'unavailable';

export interface DailyAttendanceState {
  action: DailyAttendanceAction;
  title: string;
  description: string;
  actionLabel: string;
}
