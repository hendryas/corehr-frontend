import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown, DropdownContent, DropdownItem } from 'flowbite-angular/dropdown';
import { NgpMenuTrigger } from 'ng-primitives/menu';
import { UserProfile } from '../../core/models/auth.model';
import { NotificationItem } from '../../core/models/notification.model';
import { AppIconComponent } from '../../shared/ui/app-icon/app-icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    Dropdown,
    DropdownContent,
    DropdownItem,
    NgpMenuTrigger,
    AppIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-ui-border/80 bg-ui-bg/90 backdrop-blur">
      <div class="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface text-ui-text shadow-sm transition hover:border-brand-blue/20 hover:text-brand-blue lg:hidden"
          (click)="menuToggle.emit()"
          aria-label="Open menu"
        >
          <app-icon name="menu" iconClass="h-5 w-5" />
        </button>

        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ui-muted">CoreHR dashboard</p>
          <h2 class="truncate text-lg font-bold text-ui-text">{{ pageTitle() }}</h2>
        </div>

        <div class="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-ui-border bg-ui-surface px-4 py-2.5 shadow-sm xl:flex">
          <app-icon name="search" iconClass="h-4 w-4 text-ui-muted" />
          <input
            type="search"
            placeholder="Search employees, attendance, payroll..."
            class="w-full border-none bg-transparent text-sm text-ui-text outline-none placeholder:text-ui-muted/70"
          />
        </div>

        <div #notificationShell class="relative">
          <button
            type="button"
            class="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface text-ui-text shadow-sm transition hover:border-brand-blue/20 hover:text-brand-blue"
            aria-label="Notifications"
            [attr.aria-expanded]="isNotificationPanelOpen()"
            (click)="toggleNotificationPanel()"
          >
            @if (hasUnreadNotifications()) {
              <span
                class="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 py-1 text-[10px] font-bold leading-none text-white shadow-[0_10px_18px_-12px_rgba(220,38,38,0.9)]"
              >
                {{ unreadBadgeLabel() }}
              </span>
            }
            <app-icon name="bell" iconClass="h-5 w-5" />
          </button>

          @if (isNotificationPanelOpen()) {
            <section
              class="absolute right-0 top-full z-50 mt-3 w-[min(92vw,24rem)] overflow-hidden rounded-[28px] border border-ui-border bg-ui-surface shadow-[0_28px_70px_-34px_rgba(15,23,42,0.35)]"
            >
              <header class="flex items-start justify-between gap-4 border-b border-ui-border/80 px-5 py-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">Activity</p>
                  <h3 class="mt-1 text-base font-bold text-ui-text">Notifications</h3>
                  <p class="mt-1 text-xs text-ui-muted">
                    @if (hasUnreadNotifications()) {
                      {{ unreadCount() }} belum dibaca
                    } @else {
                      Semua notifikasi sudah dibaca
                    }
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/8 hover:text-brand-blueDark disabled:cursor-not-allowed disabled:opacity-50"
                  [disabled]="!hasUnreadNotifications() || isMarkingAllAsRead()"
                  (click)="handleMarkAllAsRead()"
                >
                  {{ isMarkingAllAsRead() ? 'Updating...' : 'Mark all as read' }}
                </button>
              </header>

              @if (notificationsError()) {
                <div class="border-b border-warning/20 bg-warning/6 px-5 py-3">
                  <div class="flex items-start justify-between gap-3">
                    <p class="text-sm font-medium text-warning">{{ notificationsError() }}</p>
                    <button
                      type="button"
                      class="rounded-full px-2 py-1 text-xs font-semibold text-warning transition hover:bg-warning/10"
                      (click)="handleNotificationsRetry()"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              }

              @if (notificationsLoading() && !hasNotifications()) {
                <div class="space-y-3 px-5 py-5">
                  @for (placeholder of loadingPlaceholders; track placeholder) {
                    <div class="animate-pulse rounded-[22px] border border-ui-border/80 bg-white px-4 py-4">
                      <div class="h-3 w-28 rounded-full bg-slate-200"></div>
                      <div class="mt-3 h-4 w-40 rounded-full bg-slate-200"></div>
                      <div class="mt-2 h-3 w-full rounded-full bg-slate-100"></div>
                      <div class="mt-2 h-3 w-5/6 rounded-full bg-slate-100"></div>
                    </div>
                  }
                </div>
              } @else if (!hasNotifications()) {
                <div class="relative overflow-hidden px-5 py-6">
                  <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,111,178,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(217,161,26,0.12),_transparent_34%)]"
                  ></div>

                  <div class="relative rounded-[28px] border border-ui-border/80 bg-white/90 px-5 py-6 text-center shadow-[0_28px_60px_-44px_rgba(15,23,42,0.42)]">
                    <div class="mx-auto flex w-full max-w-[16rem] items-center justify-center">
                      <div class="relative inline-flex h-18 w-18 items-center justify-center rounded-[28px] bg-brand-blue/10 text-brand-blue">
                        <span class="absolute inset-0 rounded-[28px] border border-brand-blue/15"></span>
                        <span class="absolute -inset-3 rounded-[34px] border border-brand-blue/10"></span>
                        <app-icon name="bell" iconClass="h-7 w-7" />
                      </div>
                    </div>

                    <div class="mt-5 space-y-2">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Notifikasi</p>
                      <p class="text-base font-bold text-ui-text">Belum ada notifikasi</p>
                      <p class="text-sm leading-6 text-ui-muted">
                        Jika ada update cuti, informasinya akan muncul di sini.
                      </p>
                    </div>

                    <div class="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        class="btn-secondary w-full justify-center"
                        (click)="handleNotificationsRetry()"
                      >
                        Cek lagi
                      </button>
                      <a
                        routerLink="/leave"
                        class="btn-primary w-full justify-center text-center"
                        (click)="closeNotificationPanel()"
                      >
                        Buka cuti
                      </a>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="max-h-[min(70vh,30rem)] overflow-y-auto px-3 py-3">
                  <div class="space-y-2">
                    @for (notification of notifications(); track notification.id) {
                      <button
                        type="button"
                        class="w-full rounded-[24px] border px-4 py-4 text-left transition hover:border-brand-blue/20 hover:bg-brand-blue/6 disabled:cursor-wait disabled:opacity-70"
                        [disabled]="activeNotificationId() === notification.id"
                        [ngClass]="
                          notification.isRead
                            ? 'border-ui-border/80 bg-white'
                            : 'border-brand-blue/20 bg-brand-blue/6 shadow-[0_18px_35px_-30px_rgba(31,111,178,0.7)]'
                        "
                        (click)="handleNotificationSelected(notification)"
                      >
                        <div class="flex items-start justify-between gap-4">
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              @if (!notification.isRead) {
                                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue"></span>
                              }
                              <p class="truncate text-sm font-semibold text-ui-text">{{ notification.title }}</p>
                            </div>
                            <p class="mt-2 text-sm leading-6 text-ui-muted">{{ notification.message }}</p>
                          </div>
                          <div class="shrink-0 text-right">
                            <p class="text-xs font-medium text-ui-muted" [attr.title]="notification.createdAtAbsoluteLabel">
                              {{ notification.createdAtLabel }}
                            </p>
                            @if (activeNotificationId() === notification.id) {
                              <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
                                Opening
                              </p>
                            }
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              }
            </section>
          }
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-3 rounded-2xl border border-ui-border bg-ui-surface px-3 py-2 shadow-sm transition hover:border-brand-blue/20"
          [ngpMenuTrigger]="profileMenu"
          ngpMenuTriggerPlacement="bottom-end"
        >
          <div class="hidden text-right sm:block">
            <p class="text-sm font-semibold text-ui-text">{{ user()?.name ?? 'CoreHR Admin' }}</p>
            <p class="text-xs text-ui-muted">{{ user()?.role ?? 'Administrator' }}</p>
          </div>
          <div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-sm font-bold text-white">
            {{ user()?.initials ?? 'HR' }}
          </div>
        </button>

        <ng-template #profileMenu>
          <div flowbiteDropdown [customTheme]="dropdownTheme">
            <ul flowbiteDropdownContent [customTheme]="dropdownContentTheme">
              <li class="border-b border-ui-border/80 px-4 py-3">
                <p class="text-sm font-semibold text-ui-text">{{ user()?.name ?? 'CoreHR Admin' }}</p>
                <p class="mt-1 text-xs text-ui-muted">{{ user()?.email ?? 'admin@corehr.local' }}</p>
              </li>
              <li flowbiteDropdownItem>
                <a [routerLink]="homeRoute()" class="block w-full text-left text-ui-text">Dashboard home</a>
              </li>
              <li flowbiteDropdownItem>
                <button type="button" class="w-full text-left text-ui-text">Profile settings</button>
              </li>
              <li flowbiteDropdownItem>
                <button
                  type="button"
                  class="inline-flex w-full items-center gap-2 text-left text-danger"
                  (click)="signOut.emit()"
                >
                  <app-icon name="logout" iconClass="h-4 w-4" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </ng-template>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly notificationShell = viewChild<ElementRef<HTMLElement>>('notificationShell');

  readonly pageTitle = input('Dashboard overview');
  readonly homeRoute = input('/dashboard');
  readonly user = input<UserProfile | null>(null);
  readonly notifications = input<readonly NotificationItem[]>([]);
  readonly unreadCount = input(0);
  readonly notificationsLoading = input(false);
  readonly notificationsError = input<string | null>(null);
  readonly isMarkingAllAsRead = input(false);
  readonly activeNotificationId = input<number | null>(null);

  readonly menuToggle = output<void>();
  readonly signOut = output<void>();
  readonly notificationSelected = output<NotificationItem>();
  readonly notificationsRetry = output<void>();
  readonly notificationsMarkAllAsRead = output<void>();

  protected readonly dropdownTheme = {
    host: {
      base: 'w-64 overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-[0_24px_60px_-36px_rgba(15,23,42,0.32)]',
    },
  };

  protected readonly dropdownContentTheme = {
    host: {
      base: 'py-2 text-sm',
    },
  };
  protected readonly loadingPlaceholders = Array.from({ length: 3 }, (_, index) => index + 1);
  protected readonly hasUnreadNotifications = computed(() => this.unreadCount() > 0);
  protected readonly hasNotifications = computed(() => this.notifications().length > 0);
  protected readonly unreadBadgeLabel = computed(() =>
    this.unreadCount() > 99 ? '99+' : String(this.unreadCount()),
  );
  protected readonly isNotificationPanelOpen = signal(false);

  protected toggleNotificationPanel(): void {
    this.isNotificationPanelOpen.update((isOpen) => !isOpen);
  }

  protected closeNotificationPanel(): void {
    this.isNotificationPanelOpen.set(false);
  }

  protected handleNotificationSelected(notification: NotificationItem): void {
    this.closeNotificationPanel();
    this.notificationSelected.emit(notification);
  }

  protected handleNotificationsRetry(): void {
    this.notificationsRetry.emit();
  }

  protected handleMarkAllAsRead(): void {
    this.notificationsMarkAllAsRead.emit();
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    if (!this.isNotificationPanelOpen()) {
      return;
    }

    const notificationShell = this.notificationShell()?.nativeElement;
    const eventTarget = event.target;

    if (!(eventTarget instanceof Node) || !notificationShell || notificationShell.contains(eventTarget)) {
      return;
    }

    this.closeNotificationPanel();
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    this.closeNotificationPanel();
  }
}
