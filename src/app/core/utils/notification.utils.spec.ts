import { describe, expect, it } from 'vitest';
import { NotificationRecord } from '../models/notification.model';
import {
  formatNotificationAbsoluteTime,
  formatNotificationRelativeTime,
  mapNotificationToItem,
  resolveNotificationRoute,
} from './notification.utils';

const baseNotification: NotificationRecord = {
  id: 12,
  userId: 3,
  actorUserId: 7,
  actorName: 'Budi',
  leaveRequestId: 44,
  type: 'leave_approved',
  title: 'Pengajuan cuti disetujui',
  message: 'Pengajuan cuti Anda disetujui.',
  isRead: false,
  readAt: null,
  createdAt: '2026-04-12 10:00:00',
};

describe('notification utils', () => {
  it('resolves leave detail route when leave request id exists', () => {
    expect(resolveNotificationRoute(baseNotification, { role: 'employee' })).toBe('/leave/44');
  });

  it('formats relative timestamps in a friendly way', () => {
    expect(
      formatNotificationRelativeTime('2026-04-12 09:55:00', new Date('2026-04-12T10:00:00')),
    ).toContain('5 menit');
  });

  it('maps a notification record into a view-friendly item', () => {
    const item = mapNotificationToItem(baseNotification, { role: 'employee' }, new Date('2026-04-12T10:00:00'));

    expect(item.route).toBe('/leave/44');
    expect(item.createdAtLabel).toContain('Baru');
    expect(item.createdAtAbsoluteLabel).toBe(formatNotificationAbsoluteTime(baseNotification.createdAt));
  });
});
