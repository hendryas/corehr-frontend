import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { AuthApiService } from './core/services/auth-api.service';
import { AuthSessionService } from './core/services/auth-session.service';
import { NotificationsStoreService } from './core/services/notifications-store.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly notificationsStore = inject(NotificationsStoreService);

  constructor() {
    this.notificationsStore;

    if (!this.authSession.getAccessToken()) {
      return;
    }

    this.authApi
      .me()
      .pipe(
        catchError(() => {
          this.authSession.signOut();
          return EMPTY;
        }),
      )
      .subscribe((user) => this.authSession.updateUser(user));
  }
}
