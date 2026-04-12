import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { APP_SHELL } from '../../core/constants/app-shell.constants';
import { AuthRoutingService } from '../../core/services/auth-routing.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { NotificationsStoreService } from '../../core/services/notifications-store.service';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-ui-bg">
      @if (sidebarOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          (click)="closeSidebar()"
        ></button>
      }

      <div
        class="fixed inset-y-0 left-0 z-40 w-[18.5rem] -translate-x-full transition duration-300 sm:w-80 lg:translate-x-0 xl:w-[21rem] 2xl:w-[22.5rem]"
        [class.translate-x-0]="sidebarOpen()"
      >
        <app-sidebar
          [items]="navigationItems()"
          [user]="user()"
          (navigate)="closeSidebar()"
          (signOut)="signOut()"
        />
      </div>

      <div class="lg:pl-[18.5rem] xl:pl-[21rem] 2xl:pl-[22.5rem]">
        <app-topbar
          [pageTitle]="pageMeta().title"
          [homeRoute]="homeRoute()"
          [user]="user()"
          [notifications]="notifications()"
          [unreadCount]="unreadCount()"
          [notificationsLoading]="notificationsLoading()"
          [notificationsError]="notificationsError()"
          [isMarkingAllAsRead]="isMarkingAllAsRead()"
          [activeNotificationId]="activeNotificationId()"
          (menuToggle)="toggleSidebar()"
          (signOut)="signOut()"
          (notificationSelected)="openNotification($event)"
          (notificationsRetry)="reloadNotifications()"
          (notificationsMarkAllAsRead)="markAllNotificationsAsRead()"
        />

        <main class="px-4 pb-8 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <app-page-header
            [eyebrow]="pageMeta().eyebrow"
            [title]="pageMeta().title"
            [description]="pageMeta().description"
          />

          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly authRouting = inject(AuthRoutingService);
  private readonly notificationsStore = inject(NotificationsStoreService);

  protected readonly authenticatedUser = this.authSession.authenticatedUser;
  protected readonly navigationItems = computed(() =>
    this.authRouting.getNavigationItems(this.authenticatedUser()?.role),
  );
  protected readonly homeRoute = computed(() =>
    this.authRouting.getDefaultRoute(this.authenticatedUser()?.role),
  );
  protected readonly user = this.authSession.user;
  protected readonly notifications = this.notificationsStore.notifications;
  protected readonly unreadCount = this.notificationsStore.unreadCount;
  protected readonly notificationsLoading = this.notificationsStore.loading;
  protected readonly notificationsError = this.notificationsStore.error;
  protected readonly isMarkingAllAsRead = this.notificationsStore.isMarkingAllAsRead;
  protected readonly activeNotificationId = this.notificationsStore.activeNotificationId;
  protected readonly sidebarOpen = signal(false);

  private readonly routeSnapshot = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.resolvePageMeta()),
    ),
    { initialValue: this.resolvePageMeta() },
  );

  protected readonly pageMeta = computed(() => this.routeSnapshot());

  protected toggleSidebar(): void {
    this.sidebarOpen.update((state) => !state);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected signOut(): void {
    const loginRoute = this.authRouting.getLoginRoute(this.authenticatedUser()?.role);

    this.authSession.signOut();
    this.closeSidebar();
    void this.router.navigateByUrl(loginRoute);
  }

  protected openNotification(notification: Parameters<NotificationsStoreService['openNotification']>[0]): void {
    void this.notificationsStore.openNotification(notification);
  }

  protected reloadNotifications(): void {
    this.notificationsStore.clearError();
    void this.notificationsStore.loadNotifications();
  }

  protected markAllNotificationsAsRead(): void {
    void this.notificationsStore.markAllAsRead();
  }

  private resolvePageMeta() {
    let route: ActivatedRoute | null = this.activatedRoute;

    while (route?.firstChild) {
      route = route.firstChild;
    }

    const data = route?.snapshot?.data ?? {};

    return {
      eyebrow: data['eyebrow'] ?? APP_SHELL.dashboardEyebrow,
      title: data['title'] ?? 'Dashboard overview',
      description: data['description'] ?? APP_SHELL.dashboardDescription,
    };
  }
}
