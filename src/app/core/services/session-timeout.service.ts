import { Injectable, NgZone, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_TIMEOUT_REASON,
  SESSION_TIMEOUT_REASON_QUERY_PARAM,
} from '../constants/auth.constants';
import { AuthRoutingService } from './auth-routing.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly authRouting = inject(AuthRoutingService);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isRedirecting = false;

  constructor() {
    effect(() => {
      if (this.authSession.isAuthenticated()) {
        this.scheduleTimeout();
        return;
      }

      this.clearTimeout();
      this.isRedirecting = false;
    });
  }

  recordAuthenticatedActivity(): void {
    if (!this.authSession.isAuthenticated()) {
      return;
    }

    this.scheduleTimeout();
  }

  async expireSession(reason?: string): Promise<void> {
    if (this.isRedirecting) {
      return;
    }

    const authenticatedRole = this.authSession.authenticatedUser()?.role;

    this.isRedirecting = true;
    this.clearTimeout();
    this.authSession.signOut();

    try {
      await this.router.navigateByUrl(
        this.router.createUrlTree([this.authRouting.getLoginRoute(authenticatedRole)], {
          queryParams: this.buildQueryParams(reason),
        }),
      );
    } finally {
      this.isRedirecting = false;
    }
  }

  expireIdleSession(): Promise<void> {
    return this.expireSession(SESSION_TIMEOUT_REASON);
  }

  private scheduleTimeout(): void {
    this.clearTimeout();

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          void this.expireIdleSession();
        });
      }, SESSION_IDLE_TIMEOUT_MS);
    });
  }

  private clearTimeout(): void {
    if (this.timeoutId === null) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }

  private buildQueryParams(reason?: string): Record<string, string> {
    const queryParams: Record<string, string> = {
      redirectTo: this.router.url,
    };

    if (reason) {
      queryParams[SESSION_TIMEOUT_REASON_QUERY_PARAM] = reason;
    }

    return queryParams;
  }
}
