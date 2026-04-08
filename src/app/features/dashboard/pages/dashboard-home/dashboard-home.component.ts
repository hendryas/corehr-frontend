import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import { Badge } from 'flowbite-angular/badge';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from 'flowbite-angular/modal';
import { APP_SHELL } from '../../../../core/constants/app-shell.constants';
import {
  DashboardStat,
  EmployeeRecord,
  QuickAction,
} from '../../../../core/models/dashboard.model';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import { RecentEmployeesTableComponent } from '../../components/recent-employees-table/recent-employees-table.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    NgpDialogTrigger,
    Badge,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
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
              <span flowbiteBadge color="primary" pill class="!rounded-full !px-3 !py-1.5">Live overview</span>
              <span flowbiteBadge color="success" pill class="!rounded-full !px-3 !py-1.5">Mock data ready</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-ui-text">Welcome back to {{ brandName }}</h2>
              <p class="mt-3 max-w-3xl muted-copy">
                This dashboard foundation balances a clean enterprise layout with reusable Angular components, ready for HR modules and API integration in the next phase.
              </p>
            </div>
          </div>

          <div class="surface-card max-w-sm px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">Next integration</p>
            <p class="mt-2 text-base font-semibold text-ui-text">
              Wire authentication, employee list, and attendance endpoints into these starter widgets.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <app-stat-card [stat]="stat" />
        }
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <app-recent-employees-table [employees]="employees" />

        <aside class="surface-card p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-ui-text">Quick actions</h2>
            <p class="mt-1 muted-copy">Small shortcuts that will later connect to admin workflows and HR tools.</p>
          </div>

          <div class="space-y-3">
            @for (action of quickActions; track action.title) {
              @if (action.kind === 'modal') {
                <button
                  type="button"
                  class="group flex w-full items-start gap-4 rounded-[24px] border border-ui-border bg-ui-surface px-4 py-4 text-left transition hover:border-brand-blue/25 hover:bg-brand-blue/5"
                  [ngpDialogTrigger]="announcementDialog"
                >
                  <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/12 text-brand-blue">
                    <app-icon [name]="action.icon" iconClass="h-5 w-5" />
                  </span>
                  <span class="flex-1">
                    <span class="block font-semibold text-ui-text">{{ action.title }}</span>
                    <span class="mt-1 block text-sm text-ui-muted">{{ action.description }}</span>
                  </span>
                </button>
              } @else {
                <button
                  type="button"
                  class="group flex w-full items-start gap-4 rounded-[24px] border border-ui-border bg-ui-surface px-4 py-4 text-left transition hover:border-brand-blue/25 hover:bg-brand-blue/5"
                >
                  <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/12 text-brand-green">
                    <app-icon [name]="action.icon" iconClass="h-5 w-5" />
                  </span>
                  <span class="flex-1">
                    <span class="block font-semibold text-ui-text">{{ action.title }}</span>
                    <span class="mt-1 block text-sm text-ui-muted">{{ action.description }}</span>
                  </span>
                </button>
              }
            }
          </div>

          <ng-template #announcementDialog let-close="close">
            <div flowbiteModalOverlay position="center">
              <section flowbiteModal size="lg" class="!border !border-ui-border !bg-ui-surface">
                <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Create internal announcement</h3>
                <div flowbiteModalContent class="!space-y-5">
                  <p class="muted-copy">
                    This is a dummy modal to confirm Flowbite Angular is configured and ready for interactive UI patterns.
                  </p>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="rounded-3xl border border-ui-border bg-ui-bg p-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Draft target</p>
                      <p class="mt-2 text-lg font-semibold text-ui-text">All employees</p>
                    </div>
                    <div class="rounded-3xl border border-ui-border bg-ui-bg p-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Delivery channel</p>
                      <p class="mt-2 text-lg font-semibold text-ui-text">Portal banner</p>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-brand-gold/20 bg-brand-gold/8 p-4">
                    <p class="text-sm font-semibold text-ui-text">Backend note</p>
                    <p class="mt-2 text-sm leading-6 text-ui-muted">
                      Later this modal can be connected to a real create-announcement API or a global notification workflow.
                    </p>
                  </div>
                </div>
                <div flowbiteModalFooter class="!justify-end !border-ui-border">
                  <button type="button" class="btn-secondary" (click)="close()">Cancel</button>
                  <button type="button" class="btn-primary" (click)="close()">Save draft</button>
                </div>
              </section>
            </div>
          </ng-template>
        </aside>
      </div>
    </section>
  `,
})
export class DashboardHomeComponent {
  protected readonly brandName = APP_SHELL.brandName;

  protected readonly stats: DashboardStat[] = [
    { label: 'Total Employees', value: '248', delta: '+12 this month', accent: 'blue', icon: 'employees' },
    { label: 'Present Today', value: '231', delta: '93% attendance rate', accent: 'green', icon: 'attendance' },
    { label: 'Leave Requests', value: '14', delta: '5 need review today', accent: 'gold', icon: 'leave' },
    { label: 'Payroll Processed', value: '96%', delta: 'April cycle on track', accent: 'info', icon: 'payroll' },
  ];

  protected readonly employees: EmployeeRecord[] = [
    {
      id: 1,
      name: 'Nadia Permata',
      role: 'Senior HR Generalist',
      department: 'People Operations',
      location: 'Jakarta HQ',
      status: 'Active',
      startDate: 'Apr 03, 2026',
    },
    {
      id: 2,
      name: 'Rizky Mahendra',
      role: 'Compensation Analyst',
      department: 'Payroll',
      location: 'Bandung',
      status: 'Remote',
      startDate: 'Mar 27, 2026',
    },
    {
      id: 3,
      name: 'Dinda Prasetyo',
      role: 'Talent Acquisition Specialist',
      department: 'Recruitment',
      location: 'Surabaya',
      status: 'Onboarding',
      startDate: 'Mar 18, 2026',
    },
    {
      id: 4,
      name: 'Kevin Aditya',
      role: 'HRIS Coordinator',
      department: 'HRIS',
      location: 'Jakarta HQ',
      status: 'Active',
      startDate: 'Mar 11, 2026',
    },
    {
      id: 5,
      name: 'Maya Azzahra',
      role: 'Learning and Development Lead',
      department: 'L&D',
      location: 'Yogyakarta',
      status: 'Remote',
      startDate: 'Feb 24, 2026',
    },
    {
      id: 6,
      name: 'Bagas Wicaksono',
      role: 'Industrial Relations Officer',
      department: 'Compliance',
      location: 'Semarang',
      status: 'Active',
      startDate: 'Feb 09, 2026',
    },
  ];

  protected readonly quickActions: QuickAction[] = [
    {
      title: 'Create announcement',
      description: 'Open a branded modal pattern for future internal comms.',
      actionLabel: 'Open modal',
      icon: 'announcement',
      kind: 'modal',
    },
    {
      title: 'Invite employee',
      description: 'Placeholder action for employee onboarding and account creation.',
      actionLabel: 'Prepare flow',
      icon: 'upload',
      kind: 'ghost',
    },
    {
      title: 'Prepare policy brief',
      description: 'Starter card for upcoming HR compliance and handbook updates.',
      actionLabel: 'View draft',
      icon: 'briefcase',
      kind: 'ghost',
    },
  ];
}
