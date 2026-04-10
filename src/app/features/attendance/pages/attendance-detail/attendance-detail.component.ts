import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceSectionItem } from '../../domain/models/attendance.model';
import { AttendanceStore } from '../../state/attendance.store';
import { AttendanceInfoSectionComponent } from '../../ui/attendance-info-section/attendance-info-section.component';
import { AttendanceStatusBadgeComponent } from '../../ui/attendance-status-badge/attendance-status-badge.component';

@Component({
  selector: 'app-attendance-detail',
  standalone: true,
  imports: [RouterLink, AttendanceInfoSectionComponent, AttendanceStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Attendance detail could not be loaded</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/attendance" class="btn-secondary">Back to list</a>
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
      } @else if (store.detail(); as attendance) {
        <section class="surface-card overflow-hidden p-6">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="inline-flex h-18 w-18 items-center justify-center rounded-[26px] bg-brand-blue text-xl font-bold text-white">
                {{ attendance.initials }}
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">{{ attendance.employeeCode }}</p>
                  <h2 class="mt-2 text-3xl font-bold text-ui-text">{{ attendance.fullName }}</h2>
                  <p class="mt-2 text-sm text-ui-muted">{{ attendance.attendanceDateLabel }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <app-attendance-status-badge [status]="attendance.status" />
                  <span class="rounded-full border border-ui-border bg-ui-bg px-3 py-1.5 text-sm font-medium text-ui-text">
                    {{ attendance.roleLabel }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              @if (store.isAdmin()) {
                <a [routerLink]="['/attendance', attendance.id, 'edit']" class="btn-primary">Edit attendance</a>
              }
              <a routerLink="/attendance" class="btn-secondary">Back to list</a>
            </div>
          </div>
        </section>

        <app-attendance-info-section
          [title]="'Employee information'"
          [description]="'Basic employee details connected to this attendance record.'"
          [items]="employeeInfo()"
        />

        <app-attendance-info-section
          [title]="'Attendance information'"
          [description]="'Daily attendance timing, status, and note details.'"
          [items]="attendanceInfo()"
        />

        <app-attendance-info-section
          [title]="'Record activity'"
          [description]="'Latest record timestamps for this attendance entry.'"
          [items]="recordInfo()"
        />
      }
    </section>
  `,
})
export class AttendanceDetailComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly store = inject(AttendanceStore);

  protected readonly employeeInfo = computed<AttendanceSectionItem[]>(() => {
    const attendance = this.store.detail();

    if (!attendance) {
      return [];
    }

    return [
      { label: 'Employee', value: attendance.fullName },
      { label: 'Employee code', value: attendance.employeeCode },
      { label: 'Department', value: attendance.departmentName },
      { label: 'Position', value: attendance.positionName },
      { label: 'Role', value: attendance.roleLabel },
    ];
  });

  protected readonly attendanceInfo = computed<AttendanceSectionItem[]>(() => {
    const attendance = this.store.detail();

    if (!attendance) {
      return [];
    }

    return [
      { label: 'Attendance date', value: attendance.attendanceDateLabel },
      { label: 'Check in', value: attendance.checkInLabel },
      { label: 'Check out', value: attendance.checkOutLabel },
      { label: 'Status', value: attendance.statusLabel },
      { label: 'Notes', value: attendance.notesLabel },
    ];
  });

  protected readonly recordInfo = computed<AttendanceSectionItem[]>(() => {
    const attendance = this.store.detail();

    if (!attendance) {
      return [];
    }

    return [
      { label: 'Created at', value: attendance.createdAtLabel },
      { label: 'Updated at', value: attendance.updatedAtLabel },
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

    await this.store.loadAttendance(id);
  }
}
