import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../models/api.model';
import { AuthSessionService } from './auth-session.service';
import { NotificationsApiService } from './notifications-api.service';
import { UserRole } from '../models/auth.model';
import {
  NotificationItem,
  NotificationRecord,
  NotificationsQuery,
} from '../models/notification.model';
import { mapNotificationToItem } from '../utils/notification.utils';

const POLLING_INTERVAL_MS = 30_000;
const DEFAULT_NOTIFICATIONS_QUERY: NotificationsQuery = {
  page: 1,
  limit: 10,
  unreadOnly: false,
};

@Injectable({ providedIn: 'root' })
export class NotificationsStoreService {
  private readonly notificationsApi = inject(NotificationsApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isMarkingAllAsRead = signal(false);
  readonly activeNotificationId = signal<number | null>(null);
  readonly hasNotifications = computed(() => this.notifications().length > 0);

  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      if (this.authSession.isAuthenticated()) {
        void this.loadNotifications();
        this.startPolling();
        return;
      }

      this.stopPolling();
      this.resetState();
    });
  }

  async loadNotifications(options?: { silent?: boolean }): Promise<void> {
    if (!this.authSession.isAuthenticated()) {
      return;
    }

    const silent = options?.silent ?? false;

    if (!silent) {
      this.loading.set(true);
    }

    try {
      const response = await firstValueFrom(
        this.notificationsApi.getNotifications(DEFAULT_NOTIFICATIONS_QUERY),
      );

      this.notifications.set(
        response.items.map((notification) =>
          mapNotificationToItem(notification, { role: this.currentRole() }),
        ),
      );
      this.unreadCount.set(response.unreadCount);
      this.error.set(null);
    } catch (error) {
      this.error.set(
        this.getErrorMessage(error, 'Notifikasi belum dapat dimuat. Silakan coba lagi.'),
      );
    } finally {
      if (!silent) {
        this.loading.set(false);
      }
    }
  }

  async openNotification(notification: NotificationItem): Promise<void> {
    this.error.set(null);
    this.activeNotificationId.set(notification.id);

    try {
      if (!notification.isRead) {
        await this.markNotificationAsRead(notification.id);
      }

      const navigated = await this.router.navigateByUrl(notification.route);

      if (!navigated) {
        this.error.set('Halaman notifikasi tidak dapat dibuka. Silakan coba lagi.');
      }
    } catch {
      this.error.set('Halaman notifikasi tidak dapat dibuka. Silakan coba lagi.');
    } finally {
      this.activeNotificationId.set(null);
    }
  }

  async markAllAsRead(): Promise<boolean> {
    if (!this.authSession.isAuthenticated() || this.unreadCount() === 0) {
      return true;
    }

    this.isMarkingAllAsRead.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.notificationsApi.markAllAsRead());
      this.notifications.update((items) =>
        items.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? notification.createdAt,
        })),
      );
      this.unreadCount.set(0);
      return true;
    } catch (error) {
      this.error.set(
        this.getErrorMessage(error, 'Semua notifikasi belum dapat ditandai sebagai dibaca.'),
      );
      return false;
    } finally {
      this.isMarkingAllAsRead.set(false);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  private async markNotificationAsRead(id: number): Promise<boolean> {
    const target = this.notifications().find((notification) => notification.id === id);

    if (!target || target.isRead) {
      return true;
    }

    try {
      const updatedNotification = await firstValueFrom(this.notificationsApi.markAsRead(id));
      this.replaceNotification(updatedNotification);
      return true;
    } catch (error) {
      this.error.set(
        this.getErrorMessage(error, 'Notifikasi belum dapat ditandai sebagai dibaca.'),
      );
      return false;
    }
  }

  private replaceNotification(updatedNotification: NotificationRecord): void {
    const nextNotification = mapNotificationToItem(updatedNotification, {
      role: this.currentRole(),
    });

    this.notifications.update((items) =>
      items.map((notification) =>
        notification.id === updatedNotification.id ? nextNotification : notification,
      ),
    );

    if (!updatedNotification.isRead) {
      return;
    }

    this.unreadCount.update((count) => Math.max(0, count - 1));
  }

  private currentRole(): UserRole | null | undefined {
    return this.authSession.authenticatedUser()?.role;
  }

  private startPolling(): void {
    if (this.pollingIntervalId !== null) {
      return;
    }

    this.pollingIntervalId = setInterval(() => {
      void this.loadNotifications({ silent: true });
    }, POLLING_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollingIntervalId === null) {
      return;
    }

    clearInterval(this.pollingIntervalId);
    this.pollingIntervalId = null;
  }

  private resetState(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.loading.set(false);
    this.error.set(null);
    this.isMarkingAllAsRead.set(false);
    this.activeNotificationId.set(null);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const apiError = (error as { error?: ApiErrorResponse } | undefined)?.error;

    return typeof apiError?.message === 'string' && apiError.message.trim()
      ? apiError.message
      : fallback;
  }
}
