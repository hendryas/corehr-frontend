import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttendanceStore } from '../../state/attendance.store';
import { AttendanceFormComponent } from '../../ui/attendance-form/attendance-form.component';
import {
  buildAttendanceForm,
  getAttendanceFormValue,
  patchAttendanceForm,
} from '../../ui/attendance-form/attendance-form.utils';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [RouterLink, AttendanceFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (!store.isAdmin()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">You can't open this page</p>
            <p class="mt-2 text-sm text-ui-muted">Only HR can update attendance records.</p>
          </div>
          <a routerLink="/attendance" class="btn-secondary">Back to list</a>
        </div>
      } @else if (store.detailError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Attendance details can't be shown right now</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.detailError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/attendance" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      } @else {
        <section class="surface-card p-6">
          <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-ui-text">Edit attendance</h2>
              <p class="mt-1 muted-copy">Update the attendance status, time, or note if needed.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              @if (attendanceId) {
                <a [routerLink]="['/attendance', attendanceId]" class="btn-secondary">View</a>
              }
              <a routerLink="/attendance" class="btn-secondary">Back to list</a>
            </div>
          </div>
        </section>

        <app-attendance-form
          [form]="form"
          [mode]="'edit'"
          [employeeOptions]="store.employeeOptions()"
          [isReferenceLoading]="store.isReferenceLoading()"
          [isSubmitting]="store.isSubmitting()"
          [submitError]="store.submitError()"
          [fieldErrors]="store.formErrors()"
          (submitForm)="save()"
          (cancelForm)="goBack()"
        />
      }
    </section>
  `,
})
export class AttendanceEditComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(AttendanceStore);
  protected readonly form = buildAttendanceForm();
  protected readonly attendanceId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    if (!this.attendanceId) {
      return;
    }

    const updatedAttendance = await this.store.updateAttendance(
      this.attendanceId,
      getAttendanceFormValue(this.form),
    );

    if (updatedAttendance) {
      void this.router.navigate(['/attendance', this.attendanceId]);
    }
  }

  protected goBack(): void {
    if (this.attendanceId) {
      void this.router.navigate(['/attendance', this.attendanceId]);
      return;
    }

    void this.router.navigate(['/attendance']);
  }

  protected async reload(): Promise<void> {
    if (!this.store.isAdmin() || !this.attendanceId) {
      return;
    }

    await this.store.loadEmployeeOptions(true);
    await this.store.loadAttendance(this.attendanceId);

    const attendance = this.store.detail();

    if (!attendance) {
      return;
    }

    patchAttendanceForm(this.form, attendance);
  }
}
