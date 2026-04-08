import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

const requireAuth = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return authSession.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: { redirectTo: '/dashboard' },
      });
};

export const authGuard: CanActivateFn = () => requireAuth();

export const authChildGuard: CanActivateChildFn = () => requireAuth();
