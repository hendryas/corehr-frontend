import {
  NotificationItem,
  NotificationRecord,
  NotificationRouteContext,
} from '../models/notification.model';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('id-ID', {
  numeric: 'auto',
});

const absoluteTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function parseNotificationDate(value: string): Date | null {
  const normalizedValue = value.trim().replace(' ', 'T');
  const parsedDate = new Date(normalizedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatNotificationRelativeTime(
  value: string,
  now: Date = new Date(),
): string {
  const parsedDate = parseNotificationDate(value);

  if (!parsedDate) {
    return 'Waktu tidak tersedia';
  }

  const diffMs = parsedDate.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) {
    return 'Baru saja';
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60],
    ['hour', 60 * 60],
    ['day', 60 * 60 * 24],
    ['week', 60 * 60 * 24 * 7],
  ];

  for (const [unit, unitSeconds] of units) {
    if (absSeconds < unitSeconds * (unit === 'week' ? 5 : unit === 'day' ? 7 : 24)) {
      return relativeTimeFormatter.format(Math.round(diffSeconds / unitSeconds), unit);
    }
  }

  return formatNotificationAbsoluteTime(value);
}

export function formatNotificationAbsoluteTime(value: string): string {
  const parsedDate = parseNotificationDate(value);

  return parsedDate ? absoluteTimeFormatter.format(parsedDate) : value;
}

export function resolveNotificationRoute(
  notification: NotificationRecord,
  _context: NotificationRouteContext,
): string {
  if (notification.leaveRequestId) {
    return `/leave/${notification.leaveRequestId}`;
  }

  return '/leave';
}

export function mapNotificationToItem(
  notification: NotificationRecord,
  context: NotificationRouteContext,
  now: Date = new Date(),
): NotificationItem {
  return {
    ...notification,
    route: resolveNotificationRoute(notification, context),
    createdAtLabel: formatNotificationRelativeTime(notification.createdAt, now),
    createdAtAbsoluteLabel: formatNotificationAbsoluteTime(notification.createdAt),
  };
}
