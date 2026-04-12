import { describe, expect, it } from 'vitest';
import {
  buildLeaveForm,
  syncLeaveTypeAvailability,
} from './leave-form.utils';

describe('leave form utils', () => {
  it('marks the leave type control invalid when the selected leave type is unavailable', () => {
    const form = buildLeaveForm();

    form.controls.leaveTypeId.setValue(99);
    syncLeaveTypeAvailability(form, []);

    expect(form.controls.leaveTypeId.errors?.['unavailableLeaveType']).toBe(true);
  });

  it('clears the unavailable error when the leave type exists again', () => {
    const form = buildLeaveForm();

    form.controls.leaveTypeId.setValue(2);
    syncLeaveTypeAvailability(form, []);
    syncLeaveTypeAvailability(form, [
      {
        id: 2,
        code: 'sick_leave',
        name: 'Sick Leave',
        description: null,
        createdAt: '2026-04-12 10:00:00',
        updatedAt: '2026-04-12 10:00:00',
      },
    ]);

    expect(form.controls.leaveTypeId.errors?.['unavailableLeaveType']).toBeUndefined();
  });
});
