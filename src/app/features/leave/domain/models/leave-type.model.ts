export interface LeaveTypeRecord {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypeListItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  descriptionLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
  statusLabel: string;
}

export interface LeaveTypeFormValue {
  code: string;
  name: string;
  description: string;
}

export type LeaveTypeFormField = keyof LeaveTypeFormValue;

export type LeaveTypeFormErrors = Partial<Record<LeaveTypeFormField, string[]>>;

export interface LeaveTypeUpsertRequest {
  code: string;
  name: string;
  description: string | null;
}
