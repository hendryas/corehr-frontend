import { describe, expect, it } from 'vitest';
import {
  mapLeaveFormToRequest,
  mapLeaveToListItem,
} from './leave.mapper';
import { LeaveApiRecord } from '../models/leave.model';

const leaveRecord: LeaveApiRecord = {
  id: 11,
  userId: 2,
  employeeCode: 'EMP001',
  fullName: 'Budi Santoso',
  leaveTypeId: 1,
  leaveTypeCode: 'annual_leave',
  leaveTypeName: 'Annual Leave',
  startDate: '2026-04-20',
  endDate: '2026-04-22',
  reason: 'Liburan keluarga',
  status: 'pending',
  approvedBy: null,
  approverName: null,
  approvedAt: null,
  rejectionReason: null,
  createdAt: '2026-04-12 10:00:00',
  updatedAt: '2026-04-12 10:00:00',
};

describe('leave mapper', () => {
  it('maps leave form value to the latest leave_type_id request payload', () => {
    expect(
      mapLeaveFormToRequest(
        {
          userId: 2,
          leaveTypeId: 1,
          startDate: '2026-04-20',
          endDate: '2026-04-22',
          reason: ' Liburan keluarga ',
        },
        true,
      ),
    ).toEqual({
      user_id: 2,
      leave_type_id: 1,
      start_date: '2026-04-20',
      end_date: '2026-04-22',
      reason: 'Liburan keluarga',
    });
  });

  it('uses leaveTypeName as the user-facing label in list items', () => {
    const listItem = mapLeaveToListItem(leaveRecord, new Map());

    expect(listItem.leaveTypeId).toBe(1);
    expect(listItem.leaveTypeCode).toBe('annual_leave');
    expect(listItem.leaveTypeName).toBe('Annual Leave');
  });
});
