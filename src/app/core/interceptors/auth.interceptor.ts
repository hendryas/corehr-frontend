import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthRoutingService } from '../services/auth-routing.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const authRouting = inject(AuthRoutingService);
  const accessToken = authSession.getAccessToken();

  const authorizedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const authenticatedRole = authSession.authenticatedUser()?.role;
        const redirectTo = router.url;

        authSession.signOut();
        void router.navigateByUrl(
          router.createUrlTree([authRouting.getLoginRoute(authenticatedRole)], {
            queryParams: { redirectTo },
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
