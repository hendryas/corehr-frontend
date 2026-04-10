import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AttendanceStore } from '../../state/attendance.store';
import { AttendanceFormComponent } from '../../ui/attendance-form/attendance-form.component';
import {
  buildAttendanceForm,
  getAttendanceFormValue,
} from '../../ui/attendance-form/attendance-form.utils';

@Component({
  selector: 'app-attendance-create',
  standalone: true,
  imports: [RouterLink, AttendanceFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      @if (!store.isAdmin()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">This page is unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">
              Attendance creation is only available for HR administrators.
            </p>
          </div>
          <a routerLink="/attendance" class="btn-secondary">Back to list</a>
        </div>
      } @else if (store.referenceError()) {
        <div class="state-panel border-warning/25 bg-warning/5">
          <div>
            <p class="text-base font-semibold text-ui-text">Employee options are unavailable</p>
            <p class="mt-2 text-sm text-ui-muted">{{ store.referenceError() }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/attendance" class="btn-secondary">Back to list</a>
            <button type="button" class="btn-primary" (click)="reload()">Retry</button>
          </div>
        </div>
      }

      <section class="surface-card p-6">
        <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-ui-text">Add attendance</h2>
            <p class="mt-1 muted-copy">Create a new attendance record and complete the attendance details.</p>
          </div>
          <a routerLink="/attendance" class="btn-secondary">Back to list</a>
        </div>
      </section>

      <app-attendance-form
        [form]="form"
        [mode]="'create'"
        [employeeOptions]="store.employeeOptions()"
        [isReferenceLoading]="store.isReferenceLoading()"
        [isSubmitting]="store.isSubmitting()"
        [submitError]="store.submitError()"
        [fieldErrors]="store.formErrors()"
        (submitForm)="save()"
        (cancelForm)="goBack()"
      />
    </section>
  `,
})
export class AttendanceCreateComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(AttendanceStore);
  protected readonly form = buildAttendanceForm();

  constructor() {
    void this.reload();
  }

  protected async save(): Promise<void> {
    const createdAttendance = await this.store.createAttendance(getAttendanceFormValue(this.form));

    if (createdAttendance) {
      void this.router.navigate(['/attendance']);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/attendance']);
  }

  protected reload(): void {
    if (!this.store.isAdmin()) {
      return;
    }

    void this.store.loadEmployeeOptions(true);
  }
}
