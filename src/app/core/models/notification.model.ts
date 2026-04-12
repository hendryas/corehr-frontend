import { UserRole } from './auth.model';

export type NotificationType = 'leave_submitted' | 'leave_approved' | 'leave_rejected';

export interface NotificationRecord {
  id: number;
  userId: number;
  actorUserId: number | null;
  actorName: string | null;
  leaveRequestId: number | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationsQuery {
  page: number;
  limit: number;
  unreadOnly: boolean;
}

export interface NotificationsResponse {
  items: NotificationRecord[];
  unreadCount: number;
  pagination: NotificationsPagination;
}

export interface MarkAllNotificationsResult {
  updatedCount: number;
}

export interface NotificationItem extends NotificationRecord {
  route: string;
  createdAtLabel: string;
  createdAtAbsoluteLabel: string;
}

export interface NotificationRouteContext {
  role: UserRole | null | undefined;
}
