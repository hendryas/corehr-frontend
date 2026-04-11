import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { UserRole } from '../models/auth.model';
import { AuthRoutingService } from '../services/auth-routing.service';
import { AuthSessionService } from '../services/auth-session.service';

const resolveAllowedRoles = (
  route: ActivatedRouteSnapshot,
): readonly UserRole[] | undefined =>
  [...route.pathFromRoot]
    .reverse()
    .map((snapshot) => snapshot.data['allowedRoles'] as readonly UserRole[] | undefined)
    .find((roles) => Array.isArray(roles) && roles.length > 0);

const requireAuth = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const authRouting = inject(AuthRoutingService);
  const authenticatedUser = authSession.authenticatedUser();

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  const allowedRoles = resolveAllowedRoles(route);

  if (
    allowedRoles?.length &&
    authenticatedUser &&
    !authRouting.isAllowedRole(authenticatedUser.role, allowedRoles)
  ) {
    return router.parseUrl(authRouting.getDefaultRoute(authenticatedUser.role));
  }

  return true;
};

export const authGuard: CanActivateFn = (route, state) => requireAuth(route, state);

export const authChildGuard: CanActivateChildFn = (childRoute, state) =>
  requireAuth(childRoute, state);
