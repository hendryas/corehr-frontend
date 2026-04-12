import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import {
  DepartmentOption,
  EmployeeFormErrors,
  EmployeeFormField,
  EmployeeFormMode,
  PositionOption,
} from '../../domain/models/employee.model';
import { EmployeeFormGroup } from './employee-form.utils';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="grid gap-6" [formGroup]="form()" (ngSubmit)="handleSubmit()">
      @if (submitError()) {
        <div class="rounded-[24px] border border-danger/20 bg-danger/5 px-5 py-4">
          <p class="text-sm font-semibold text-danger">{{ submitError() }}</p>
        </div>
      }

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Basic information</h2>
          <p class="mt-1 muted-copy">Enter the main details for this employee.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="field-label" for="employeeCode">Employee code</label>
            <input id="employeeCode" type="text" class="field-shell" formControlName="employeeCode" placeholder="EMP004" />
            @if (isEmployeeCodeLoading()) {
              <p class="text-xs text-ui-muted">Preparing employee code...</p>
            } @else if (employeeCodeStatusMessage()) {
              <p
                class="text-xs"
                [class.text-ui-muted]="employeeCodeStatusTone() === 'default'"
                [class.text-warning]="employeeCodeStatusTone() === 'warning'"
              >
                {{ employeeCodeStatusMessage() }}
              </p>
            }
            @if (errorFor('employeeCode')) {
              <p class="field-error">{{ errorFor('employeeCode') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="fullName">Full name</label>
            <input id="fullName" type="text" class="field-shell" formControlName="fullName" placeholder="Aisyah Putri" />
            @if (errorFor('fullName')) {
              <p class="field-error">{{ errorFor('fullName') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="email">Email address</label>
            <input id="email" type="email" class="field-shell" formControlName="email" placeholder="employee@corehr.local" />
            @if (errorFor('email')) {
              <p class="field-error">{{ errorFor('email') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="password">
              {{ mode() === 'create' ? 'Password' : 'New password' }}
            </label>

            <div class="relative">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="field-shell pr-16"
                formControlName="password"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-full p-2 text-brand-blue transition hover:bg-brand-blue/8 hover:text-brand-blueDark focus:outline-none"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
              >
                <app-icon
                  [name]="showPassword() ? 'eye-off' : 'eye'"
                  iconClass="h-5 w-5"
                />
              </button>
            </div>

            <p class="text-xs text-ui-muted">
              {{ mode() === 'create' ? 'Required for a new employee account.' : 'Leave blank to keep the current password.' }}
            </p>
            @if (errorFor('password')) {
              <p class="field-error">{{ errorFor('password') }}</p>
            }
          </div>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Personal information</h2>
          <p class="mt-1 muted-copy">Add contact details if needed.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="field-label" for="phone">Phone number</label>
            <input id="phone" type="text" class="field-shell" formControlName="phone" placeholder="081200000001" />
            @if (errorFor('phone')) {
              <p class="field-error">{{ errorFor('phone') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="gender">Gender</label>
            <select id="gender" class="field-shell" formControlName="gender">
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            @if (errorFor('gender')) {
              <p class="field-error">{{ errorFor('gender') }}</p>
            }
          </div>

          <div class="space-y-2 md:col-span-2">
            <label class="field-label" for="address">Address</label>
            <textarea
              id="address"
              rows="4"
              class="field-shell min-h-28 resize-y"
              formControlName="address"
              placeholder="City or full address"
            ></textarea>
            @if (errorFor('address')) {
              <p class="field-error">{{ errorFor('address') }}</p>
            }
          </div>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="border-b border-ui-border pb-4">
          <h2 class="text-xl font-bold text-ui-text">Work details</h2>
          <p class="mt-1 muted-copy">Set the role, department, position, and employment status.</p>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="field-label" for="role">Role</label>
            <select id="role" class="field-shell" formControlName="role">
              <option value="employee">Employee</option>
              <option value="admin_hr">HR Administrator</option>
            </select>
            @if (errorFor('role')) {
              <p class="field-error">{{ errorFor('role') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="isActive">Employment status</label>
            <select id="isActive" class="field-shell" formControlName="isActive">
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
            @if (errorFor('isActive')) {
              <p class="field-error">{{ errorFor('isActive') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="departmentId">Department</label>
            <select
              id="departmentId"
              class="field-shell"
              formControlName="departmentId"
              [disabled]="isReferenceLoading()"
              (change)="onDepartmentChange()"
            >
              <option [ngValue]="null">Select department</option>
              @for (department of departments(); track department.id) {
                <option [ngValue]="department.id">{{ department.name }}</option>
              }
            </select>
            @if (errorFor('departmentId')) {
              <p class="field-error">{{ errorFor('departmentId') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="positionId">Position</label>
            <select
              id="positionId"
              class="field-shell"
              formControlName="positionId"
              [disabled]="isReferenceLoading() || availablePositions().length === 0"
            >
              <option [ngValue]="null">Select position</option>
              @for (position of availablePositions(); track position.id) {
                <option [ngValue]="position.id">{{ positionLabel(position) }}</option>
              }
            </select>
            @if (!form().controls.departmentId.value) {
              <p class="text-xs text-ui-muted">Select a department first to see the position list.</p>
            }
            @if (errorFor('positionId')) {
              <p class="field-error">{{ errorFor('positionId') }}</p>
            }
          </div>

          <div class="space-y-2">
            <label class="field-label" for="hireDate">Hire date</label>
            <input id="hireDate" type="date" class="field-shell" formControlName="hireDate" />
            @if (errorFor('hireDate')) {
              <p class="field-error">{{ errorFor('hireDate') }}</p>
            }
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" (click)="cancelForm.emit()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Saving...' : mode() === 'create' ? 'Create employee' : 'Save changes' }}
        </button>
      </div>
    </form>
  `,
})
export class EmployeeFormComponent {
  readonly form = input.required<EmployeeFormGroup>();
  readonly mode = input.required<EmployeeFormMode>();
  readonly departments = input.required<DepartmentOption[]>();
  readonly positions = input.required<PositionOption[]>();
  readonly isReferenceLoading = input(false);
  readonly isEmployeeCodeLoading = input(false);
  readonly employeeCodeStatusMessage = input<string | null>(null);
  readonly employeeCodeStatusTone = input<'default' | 'warning'>('default');
  readonly isSubmitting = input(false);
  readonly submitError = input<string | null>(null);
  readonly fieldErrors = input<EmployeeFormErrors>({});

  readonly submitForm = output<void>();
  readonly cancelForm = output<void>();
  protected readonly showPassword = signal(false);

  protected handleSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitForm.emit();
  }

  protected togglePassword(): void {
    this.showPassword.update((current) => !current);
  }

  protected availablePositions(): PositionOption[] {
    const departmentId = this.form().controls.departmentId.value;

    if (!departmentId) {
      return this.positions();
    }

    return this.positions().filter((position) => position.departmentId === departmentId);
  }

  protected onDepartmentChange(): void {
    const departmentId = this.form().controls.departmentId.value;
    const positionControl = this.form().controls.positionId;
    const positionId = positionControl.value;

    if (!departmentId) {
      positionControl.setValue(null);
      return;
    }

    const positionStillAvailable = this.positions().some(
      (position) => position.id === positionId && position.departmentId === departmentId,
    );

    if (!positionStillAvailable) {
      positionControl.setValue(null);
    }
  }

  protected positionLabel(position: PositionOption): string {
    return `${position.name} - ${position.departmentName}`;
  }

  protected errorFor(field: EmployeeFormField): string | null {
    const apiMessages = this.fieldErrors()[field];

    if (apiMessages?.length) {
      return apiMessages[0];
    }

    const control = this.form().controls[field];

    if (!control.touched || !control.invalid) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (control.errors?.['email']) {
      return 'Use a valid email address.';
    }

    if (control.errors?.['minlength']) {
      return 'Use at least 8 characters.';
    }

    return 'Please review this field.';
  }
}
