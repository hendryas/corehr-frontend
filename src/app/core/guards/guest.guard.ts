import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRoutingService } from '../services/auth-routing.service';
import { AuthSessionService } from '../services/auth-session.service';

export const guestGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const authRouting = inject(AuthRoutingService);
  const authenticatedUser = authSession.authenticatedUser();

  return authSession.isAuthenticated() && authenticatedUser
    ? router.parseUrl(authRouting.getDefaultRoute(authenticatedUser.role))
    : true;
};
