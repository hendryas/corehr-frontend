import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Badge } from 'flowbite-angular/badge';
import { APP_SHELL } from '../../../../core/constants/app-shell.constants';
import {
  DashboardStat,
  EmployeeRecord,
  QuickAction,
  DashboardStatsPayload,
  EmployeeListItem,
} from '../../../../core/models/dashboard.model';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import { RecentEmployeesTableComponent } from '../../components/recent-employees-table/recent-employees-table.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    RouterLink,
    Badge,
    AppIconComponent,
    StatCardComponent,
    RecentEmployeesTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <div class="surface-card relative overflow-hidden px-6 py-7 sm:px-8">
        <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,_rgba(31,111,178,0.16),_transparent_46%)]"></div>
        <div class="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <span flowbiteBadge color="primary" pill class="!rounded-full !px-3 !py-1.5">Overview</span>
              <span
                flowbiteBadge
                [color]="loadError() ? 'warning' : 'success'"
                pill
                class="!rounded-full !px-3 !py-1.5"
              >
                {{ isLoading() ? 'Updating data' : loadError() ? 'Need attention' : 'Data is ready' }}
              </span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-ui-text">Welcome back to {{ brandName }}</h2>
              <p class="mt-3 max-w-3xl muted-copy">
                Review employee totals, attendance, leave requests, and organization updates from one dashboard.
              </p>
            </div>
          </div>

          <div class="surface-card max-w-sm px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">Today at a glance</p>
            <p class="mt-2 text-base font-semibold text-ui-text">
              Use this page to monitor key HR activity and open the section you need next.
            </p>
          </div>
        </div>
      </div>

      @if (loadError()) {
        <div class="rounded-[28px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-ui-text">Data could not be loaded</p>
              <p class="mt-1 text-sm text-ui-muted">{{ loadError() }}</p>
            </div>
            <button type="button" class="btn-secondary" (click)="loadDashboard()">Retry</button>
          </div>
        </div>
      }

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <app-stat-card [stat]="stat" />
        }
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div class="grid gap-4">
          @if (employeeListWarning()) {
            <div class="rounded-[28px] border border-warning/20 bg-warning/5 px-5 py-4">
              <p class="text-sm font-semibold text-ui-text">Employee list is temporarily unavailable</p>
              <p class="mt-1 text-sm text-ui-muted">{{ employeeListWarning() }}</p>
            </div>
          }

          <app-recent-employees-table [employees]="employees()" />
        </div>

        <aside class="surface-card p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-ui-text">Quick actions</h2>
            <p class="mt-1 muted-copy">Open the section you need most often without leaving the dashboard.</p>
          </div>

          <div class="space-y-3">
            @for (action of quickActions; track action.title) {
              <a
                [routerLink]="action.route"
                class="group flex w-full items-start gap-4 rounded-[24px] border border-ui-border bg-ui-surface px-4 py-4 text-left transition hover:border-brand-blue/25 hover:bg-brand-blue/5"
              >
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/12 text-brand-blue">
                  <app-icon [name]="action.icon" iconClass="h-5 w-5" />
                </span>
                <span class="flex-1">
                  <span class="block font-semibold text-ui-text">{{ action.title }}</span>
                  <span class="mt-1 block text-sm text-ui-muted">{{ action.description }}</span>
                </span>
              </a>
            }
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class DashboardHomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  protected readonly brandName = APP_SHELL.brandName;
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly employeeListWarning = signal<string | null>(null);

  protected readonly stats = signal<DashboardStat[]>(this.buildLoadingStats());

  protected readonly employees = signal<EmployeeRecord[]>([]);

  protected readonly quickActions: QuickAction[] = [
    {
      title: 'Manage employees',
      description: 'Review employee data, roles, and work details.',
      icon: 'employees',
      kind: 'route',
      route: '/employees',
    },
    {
      title: 'Check attendance',
      description: 'See today’s attendance records and recent activity.',
      icon: 'attendance',
      kind: 'route',
      route: '/attendance',
    },
    {
      title: 'Review leave requests',
      description: 'Open leave submissions, approvals, and request history.',
      icon: 'leave',
      kind: 'route',
      route: '/leave',
    },
  ];

  constructor() {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.employeeListWarning.set(null);

    forkJoin({
      stats: this.dashboardApi.getStats(),
      employees: this.dashboardApi.getRecentEmployees().pipe(
        catchError((error: unknown) => {
          this.employeeListWarning.set(this.getErrorMessage(error));
          return of([]);
        }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, employees }) => {
          this.stats.set(this.mapStats(stats));
          this.employees.set(employees.map((employee) => this.mapEmployee(employee)));
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.stats.set(this.buildLoadingStats('Unavailable'));
          this.employees.set([]);
          this.loadError.set(this.getErrorMessage(error));
          this.isLoading.set(false);
        },
      });
  }

  private buildLoadingStats(value = '...'): DashboardStat[] {
    return [
      { label: 'Total Employees', value, delta: 'Employee totals will appear here', accent: 'blue', icon: 'employees' },
      { label: 'Present Today', value, delta: 'Attendance updates will appear here', accent: 'green', icon: 'attendance' },
      { label: 'Pending Leaves', value, delta: 'Leave requests waiting for review will appear here', accent: 'gold', icon: 'leave' },
      { label: 'Departments', value, delta: 'Department totals will appear here', accent: 'info', icon: 'briefcase' },
    ];
  }

  private mapStats(stats: DashboardStatsPayload): DashboardStat[] {
    return [
      {
        label: 'Total Employees',
        value: String(stats.totalEmployees),
        delta: `${stats.activeEmployees} active employees`,
        accent: 'blue',
        icon: 'employees',
      },
      {
        label: 'Present Today',
        value: String(stats.totalAttendancesToday),
        delta: `${stats.totalApprovedLeaves} approved leave records`,
        accent: 'green',
        icon: 'attendance',
      },
      {
        label: 'Pending Leaves',
        value: String(stats.totalPendingLeaves),
        delta: `${stats.totalRejectedLeaves} rejected requests`,
        accent: 'gold',
        icon: 'leave',
      },
      {
        label: 'Departments',
        value: String(stats.totalDepartments),
        delta: `${stats.totalPositions} positions available`,
        accent: 'info',
        icon: 'briefcase',
      },
    ];
  }

  private mapEmployee(employee: EmployeeListItem): EmployeeRecord {
    return {
      id: employee.id,
      name: employee.fullName,
      role: employee.positionName ?? this.formatRole(employee.role),
      department: employee.departmentName ?? 'Unassigned',
      location: employee.address ?? 'No address yet',
      status: employee.isActive ? 'Active' : 'Inactive',
      startDate: this.formatDate(employee.hireDate),
    };
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return 'Not available';
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? value : this.dateFormatter.format(parsedDate);
  }

  private formatRole(role: EmployeeListItem['role']): string {
    return role === 'admin_hr' ? 'HR Administrator' : 'Employee';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;

      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }

    return 'Please try again in a moment. If the problem continues, check the server connection.';
  }
}
