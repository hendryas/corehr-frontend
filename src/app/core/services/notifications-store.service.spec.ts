import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedUser } from '../models/auth.model';
import { NotificationRecord } from '../models/notification.model';
import { AuthSessionService } from './auth-session.service';
import { NotificationsApiService } from './notifications-api.service';
import { NotificationsStoreService } from './notifications-store.service';

const authenticatedUser: AuthenticatedUser = {
  id: 3,
  employeeCode: 'EMP003',
  fullName: 'Salsa Putri',
  email: 'salsa@corehr.id',
  phone: null,
  gender: null,
  address: null,
  hireDate: '2025-01-01',
  isActive: true,
  role: 'employee',
  departmentId: 1,
  departmentName: 'People Operations',
  positionId: 4,
  positionName: 'HR Specialist',
};

const unreadNotification: NotificationRecord = {
  id: 1,
  userId: 3,
  actorUserId: 7,
  actorName: 'Budi',
  leaveRequestId: 11,
  type: 'leave_approved',
  title: 'Pengajuan cuti disetujui',
  message: 'Pengajuan cuti Anda disetujui.',
  isRead: false,
  readAt: null,
  createdAt: '2026-04-12 10:00:00',
};

describe('NotificationsStoreService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('loads notifications and marks all as read locally after success', async () => {
    const notificationsApiMock = {
      getNotifications: vi.fn(() =>
        of({
          items: [unreadNotification],
          unreadCount: 1,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        }),
      ),
      markAsRead: vi.fn(() => of({ ...unreadNotification, isRead: true, readAt: '2026-04-12 10:01:00' })),
      markAllAsRead: vi.fn(() => of({ updatedCount: 1 })),
    };
    const authenticatedUserState = signal<AuthenticatedUser | null>(authenticatedUser);
    const authSessionMock = {
      authenticatedUser: authenticatedUserState,
      isAuthenticated: computed(() => authenticatedUserState() !== null),
    };

    await TestBed.configureTestingModule({
      providers: [
        NotificationsStoreService,
        {
          provide: NotificationsApiService,
          useValue: notificationsApiMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionMock,
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compileComponents();

    const store = TestBed.inject(NotificationsStoreService);

    await store.loadNotifications();

    expect(store.notifications()).toHaveLength(1);
    expect(store.unreadCount()).toBe(1);

    await store.markAllAsRead();

    expect(store.unreadCount()).toBe(0);
    expect(store.notifications()[0]?.isRead).toBe(true);
    expect(notificationsApiMock.markAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('marks a notification as read before navigating to its route', async () => {
    const routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    const notificationsApiMock = {
      getNotifications: vi.fn(() =>
        of({
          items: [unreadNotification],
          unreadCount: 1,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        }),
      ),
      markAsRead: vi.fn(() =>
        of({ ...unreadNotification, isRead: true, readAt: '2026-04-12 10:01:00' }),
      ),
      markAllAsRead: vi.fn(() => of({ updatedCount: 1 })),
    };
    const authenticatedUserState = signal<AuthenticatedUser | null>(authenticatedUser);
    const authSessionMock = {
      authenticatedUser: authenticatedUserState,
      isAuthenticated: computed(() => authenticatedUserState() !== null),
    };

    await TestBed.configureTestingModule({
      providers: [
        NotificationsStoreService,
        {
          provide: NotificationsApiService,
          useValue: notificationsApiMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    const store = TestBed.inject(NotificationsStoreService);

    await store.loadNotifications();

    await store.openNotification(store.notifications()[0]!);

    expect(notificationsApiMock.markAsRead).toHaveBeenCalledWith(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/leave/11');
    expect(store.notifications()[0]?.isRead).toBe(true);
    expect(store.unreadCount()).toBe(0);
  });
});
