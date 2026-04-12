import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { SESSION_IDLE_TIMEOUT_CODE } from '../constants/auth.constants';
import { ApiErrorResponse } from '../models/api.model';
import { AuthSessionService } from '../services/auth-session.service';
import { SessionTimeoutService } from '../services/session-timeout.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const sessionTimeout = inject(SessionTimeoutService);
  const accessToken = authSession.getAccessToken();
  const isAuthenticatedRequest = Boolean(accessToken);

  const authorizedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authorizedRequest).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && isAuthenticatedRequest) {
        sessionTimeout.recordAuthenticatedActivity();
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const apiError = error.error as ApiErrorResponse | undefined;

        if (apiError?.code === SESSION_IDLE_TIMEOUT_CODE) {
          void sessionTimeout.expireIdleSession();
        } else {
          void sessionTimeout.expireSession();
        }
      }

      return throwError(() => error);
    }),
  );
};
