import { Injectable, computed, signal } from '@angular/core';
import { LoginCredentials, UserProfile } from '../models/auth.model';
import { getInitials } from '../../shared/utils/string.utils';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'corehr.admin.session';
  private readonly userState = signal<UserProfile | null>(this.restoreSession());

  readonly user = computed(() => this.userState());
  readonly isAuthenticated = computed(() => this.userState() !== null);

  signIn(credentials: LoginCredentials): void {
    const userProfile: UserProfile = {
      name: 'Alya Prameswari',
      email: credentials.email,
      role: 'HR Operations Lead',
      initials: getInitials('Alya Prameswari'),
    };

    this.userState.set(userProfile);
    this.persistSession(userProfile);
  }

  signOut(): void {
    this.userState.set(null);
    this.clearSession();
  }

  private restoreSession(): UserProfile | null {
    try {
      const rawSession = localStorage.getItem(this.storageKey);
      return rawSession ? (JSON.parse(rawSession) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  private persistSession(user: UserProfile): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch {
      // Ignore storage failures for the dummy session.
    }
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore storage failures for the dummy session.
    }
  }
}
