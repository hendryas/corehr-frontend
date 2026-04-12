import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { APP_SHELL } from '../../../../core/constants/app-shell.constants';
import {
  SESSION_TIMEOUT_REASON,
  SESSION_TIMEOUT_REASON_QUERY_PARAM,
} from '../../../../core/constants/auth.constants';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import { createLoginForm } from '../../domain/login-form.utils';
import { AuthLoginStore } from '../../state/auth-login.store';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent],
  providers: [AuthLoginStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative flex min-h-screen items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(47,125,74,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(31,111,178,0.12),_transparent_24%)]"></div>

      <div class="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-ui-border/80 bg-white/72 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <div class="flex items-center px-6 py-8 sm:px-10 lg:px-12">
          <div class="mx-auto w-full max-w-md">
            <div class="mb-10 space-y-4">
              <div class="inline-flex items-center gap-3 rounded-full border border-brand-green/15 bg-brand-green/8 px-4 py-2">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-green text-sm font-bold text-white">
                  E
                </span>
                <span class="text-sm font-semibold text-brand-green">{{ brandName }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">Employee sign in</p>
                <h1 class="mt-3 text-4xl font-bold text-ui-text">Welcome back</h1>
                <p class="mt-3 muted-copy">{{ subtitle }}</p>
              </div>
            </div>

            @if (sessionTimeoutMessage()) {
              <div class="mb-6 rounded-2xl border border-brand-green/20 bg-brand-green/8 px-4 py-3 text-sm font-medium text-brand-greenDark">
                {{ sessionTimeoutMessage() }}
              </div>
            }

            <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
              <div class="space-y-2">
                <label for="employee-login-email" class="field-label">Work email</label>
                <input
                  id="employee-login-email"
                  type="email"
                  formControlName="email"
                  placeholder="employee@corehr.id"
                  autocomplete="username"
                  inputmode="email"
                  class="auth-input"
                />
                @if (form.controls.email.invalid && form.controls.email.touched) {
                  <p class="text-sm font-medium text-danger">Use your company email to continue.</p>
                }
              </div>

              <div class="space-y-2">
                <label for="employee-login-password" class="field-label">Password</label>

                <div class="relative">
                  <input
                    id="employee-login-password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    class="auth-input pr-16"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-full p-2 text-brand-green transition hover:bg-brand-green/8 hover:text-brand-greenDark focus:outline-none"
                    (click)="togglePassword()"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  >
                    <app-icon
                      [name]="showPassword() ? 'eye-off' : 'eye'"
                      iconClass="h-5 w-5"
                    />
                  </button>
                </div>

                @if (form.controls.password.invalid && form.controls.password.touched) {
                  <p class="text-sm font-medium text-danger">Enter your password to continue.</p>
                }
              </div>

              <button
                type="submit"
                class="btn-primary w-full justify-center !py-3"
                [disabled]="form.invalid || store.isSubmitting()"
              >
                {{ store.isSubmitting() ? 'Signing in...' : 'Sign in' }}
              </button>

              @if (store.errorMessage()) {
                <div class="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                  {{ store.errorMessage() }}
                </div>
              }
            </form>

            <div class="mt-6 rounded-[24px] border border-ui-border bg-ui-surface/80 px-4 py-4">
              <p class="text-sm text-ui-muted">
                Signing in as HR?
                <a routerLink="/login" class="font-semibold text-brand-blue transition hover:text-brand-blueDark">
                  Go to HR sign in
                </a>
              </p>
            </div>

            <div class="mt-8 grid gap-4 rounded-[28px] border border-ui-border bg-ui-surface p-5 sm:grid-cols-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">For</p>
                <p class="mt-2 text-sm font-semibold text-ui-text">Employees</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Use</p>
                <p class="mt-2 text-sm font-semibold text-ui-text">Work email</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">After sign in</p>
                <p class="mt-2 text-sm font-semibold text-ui-text">Open workspace</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative hidden overflow-hidden border-l border-ui-border/80 bg-slate-950 px-10 py-12 text-white xl:flex">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(47,125,74,0.26),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(31,111,178,0.22),_transparent_30%)]"></div>
          <div class="relative flex w-full flex-col justify-between">
            <div class="space-y-6">
              <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-gold">CoreHR for employees</p>
              <h2 class="max-w-md text-4xl font-bold leading-tight">
                Handle attendance, leave, and personal HR updates in one simple workspace.
              </h2>
              <p class="max-w-lg text-base leading-7 text-slate-300">
                Check your daily records, send requests, and stay up to date without leaving one place.
              </p>
            </div>

            <div class="grid gap-4">
              <div class="rounded-[28px] border border-white/10 bg-white/6 p-6">
                <p class="text-sm font-semibold text-brand-gold">What you can do</p>
                <p class="mt-3 text-2xl font-bold">Stay on top of your HR needs</p>
                <p class="mt-3 text-sm leading-6 text-slate-300">
                  View attendance, submit leave requests, and keep track of important updates from HR.
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <p class="text-sm font-semibold text-white">Need HR sign in?</p>
                  <p class="mt-4 text-sm leading-6 text-slate-300">
                    HR users can sign in through a separate page to manage employees, attendance, and company records.
                  </p>
                </div>
                <div class="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <p class="text-sm font-semibold text-white">Session ended?</p>
                  <p class="mt-4 text-sm leading-6 text-slate-300">
                    If you're signed out after being idle, sign in again to continue where you left off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class EmployeeLoginComponent {
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly store = inject(AuthLoginStore);
  protected readonly brandName = APP_SHELL.brandName;
  protected readonly subtitle =
    'Sign in to check attendance, submit leave requests, and see personal HR updates.';
  protected readonly form = createLoginForm();
  protected readonly showPassword = signal(false);
  private readonly queryParamMap = toSignal(this.activatedRoute.queryParamMap, {
    initialValue: this.activatedRoute.snapshot.queryParamMap,
  });
  protected readonly sessionTimeoutMessage = computed(() =>
    this.queryParamMap().get(SESSION_TIMEOUT_REASON_QUERY_PARAM) === SESSION_TIMEOUT_REASON
      ? 'Your session ended after 15 minutes of inactivity. Please sign in again.'
      : null,
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    void this.store.signIn(this.form.getRawValue(), {
      expectedRole: 'employee',
      roleMismatchMessage:
        'This page is only for employee accounts. Use the HR sign-in page if needed.',
    });
  }

  protected togglePassword(): void {
    this.showPassword.update((current) => !current);
  }
}
