import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeSectionItem } from '../../domain/models/employee.model';
import { EmployeesStore } from '../../state/employees.store';
import { EmployeeInfoSectionComponent } from '../../ui/employee-info-section/employee-info-section.component';
import { EmployeeStatusBadgeComponent } from '../../ui/employee-status-badge/employee-status-badge.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink, EmployeeInfoSectionComponent, EmployeeStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Employee information could not be loaded</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/employees" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else if (store.isDetailLoading() && !store.detail()) {
        <section class="surface-card p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-10 w-2/3 rounded-full bg-slate-200"></div>
            <div class="h-24 rounded-[28px] bg-slate-100"></div>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="h-40 rounded-[28px] bg-slate-100"></div>
              <div class="h-40 rounded-[28px] bg-slate-100"></div>
            </div>
          </div>
        </section>
      } @else if (store.detail(); as employee) {
        <section class="surface-card overflow-hidden p-6">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="inline-flex h-18 w-18 items-center justify-center rounded-[26px] bg-brand-blue text-xl font-bold text-white">
                {{ employee.initials }}
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">{{ employee.employeeCode }}</p>
                  <h2 class="mt-2 text-3xl font-bold text-ui-text">{{ employee.fullName }}</h2>
                  <p class="mt-2 text-sm text-ui-muted">{{ employee.email }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <app-employee-status-badge [isActive]="employee.isActive" />
                  <span class="rounded-full border border-ui-border bg-ui-bg px-3 py-1.5 text-sm font-medium text-ui-text">
                    {{ employee.roleLabel }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <a [routerLink]="['/employees', employee.id, 'edit']" class="btn-primary">Edit employee</a>
              <a routerLink="/employees" class="btn-secondary">Back to list</a>
            </div>
          </div>
        </section>

        <app-employee-info-section
          title="Personal information"
          description="General contact and profile details."
          [items]="personalInfo()"
        />

        <app-employee-info-section
          title="Work information"
          description="Role, department, and work-related details."
          [items]="workInfo()"
        />

        <app-employee-info-section
          title="Status"
          description="Current employee status and latest record updates."
          [items]="statusInfo()"
        />
      }
    </section>
  `,
})
export class EmployeeDetailComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly store = inject(EmployeesStore);

  protected readonly personalInfo = computed<EmployeeSectionItem[]>(() => {
    const employee = this.store.detail();

    if (!employee) {
      return [];
    }

    return [
      { label: 'Email address', value: employee.email },
      { label: 'Phone number', value: employee.phoneLabel },
      { label: 'Gender', value: employee.genderLabel },
      { label: 'Address', value: employee.addressLabel },
    ];
  });

  protected readonly workInfo = computed<EmployeeSectionItem[]>(() => {
    const employee = this.store.detail();

    if (!employee) {
      return [];
    }

    return [
      { label: 'Employee code', value: employee.employeeCode },
      { label: 'Department', value: employee.departmentName },
      { label: 'Position', value: employee.positionName },
      { label: 'Hire date', value: employee.hireDateLabel },
      { label: 'Role', value: employee.roleLabel },
    ];
  });

  protected readonly statusInfo = computed<EmployeeSectionItem[]>(() => {
    const employee = this.store.detail();

    if (!employee) {
      return [];
    }

    return [
      { label: 'Employment status', value: employee.statusLabel },
      { label: 'Created at', value: employee.createdAt },
      { label: 'Updated at', value: employee.updatedAt },
    ];
  });

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    await this.store.loadEmployee(id);
  }
}
