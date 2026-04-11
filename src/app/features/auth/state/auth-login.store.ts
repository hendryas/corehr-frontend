import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginCredentials, UserRole } from '../../../core/models/auth.model';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { AuthRoutingService } from '../../../core/services/auth-routing.service';
import { AuthSessionService } from '../../../core/services/auth-session.service';

interface LoginFlowOptions {
  expectedRole: UserRole;
  roleMismatchMessage: string;
}

@Injectable()
export class AuthLoginStore {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly authRouting = inject(AuthRoutingService);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  async signIn(credentials: LoginCredentials, options: LoginFlowOptions): Promise<boolean> {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const session = await firstValueFrom(this.authApi.login(credentials));

      if (session.user.role !== options.expectedRole) {
        this.authSession.signOut();
        this.errorMessage.set(options.roleMismatchMessage);
        return false;
      }

      const targetRoute =
        this.getRedirectTarget() ?? this.authRouting.getDefaultRoute(session.user.role);
      const navigated = await this.router.navigateByUrl(targetRoute);

      if (!navigated) {
        this.errorMessage.set(
          'Login berhasil, tetapi halaman tujuan tidak dapat dibuka. Silakan coba lagi.',
        );
      }

      return navigated;
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getRedirectTarget(): string | null {
    const redirectTo = this.activatedRoute.snapshot.queryParamMap.get('redirectTo')?.trim();

    if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
      return null;
    }

    return redirectTo;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;

      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }

    return 'Login gagal. Pastikan backend berjalan dan kredensial benar.';
  }
}
