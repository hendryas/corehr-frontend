export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequestStatusFilter = 'all' | LeaveRequestStatus;

export type LeaveFormMode = 'create' | 'edit';

export type LeaveActionType = 'approve' | 'reject' | 'delete' | null;

export interface LeaveApiRecord {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
  approvedBy: number | null;
  approverName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeavesListResponse {
  items: LeaveApiRecord[];
  pagination: LeavePagination;
}

export interface LeaveListQuery {
  search: string;
  status: LeaveRequestStatusFilter;
  leaveTypeId: number | null;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export interface LeaveEmployeeOption {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentName: string | null;
  positionName: string | null;
  isActive: boolean;
}

export interface LeaveEmployeeListResponse {
  items: LeaveEmployeeOption[];
  pagination: LeavePagination;
}

export interface LeaveListItem {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  departmentName: string;
  positionName: string;
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  requestDate: string;
  requestDateLabel: string;
  startDate: string;
  startDateLabel: string;
  endDate: string;
  endDateLabel: string;
  totalDays: number;
  totalDaysLabel: string;
  status: LeaveRequestStatus;
  statusLabel: string;
  reason: string;
  reasonLabel: string;
}

export interface LeaveDetail extends LeaveListItem {
  approverName: string | null;
  approverNameLabel: string;
  approvedAt: string | null;
  approvedAtLabel: string;
  rejectionReason: string | null;
  rejectionReasonLabel: string;
  createdAt: string;
  createdAtLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
  initials: string;
}

export interface LeaveFormValue {
  userId: number | null;
  leaveTypeId: number | null;
  startDate: string;
  endDate: string;
  reason: string;
}

export type LeaveFormField = keyof LeaveFormValue;

export type LeaveFormErrors = Partial<Record<LeaveFormField, string[]>>;

export interface LeaveUpsertRequest {
  user_id?: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface LeaveRejectRequest {
  rejection_reason: string;
}

export interface LeaveSectionItem {
  label: string;
  value: string;
}

export interface LeaveSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}
