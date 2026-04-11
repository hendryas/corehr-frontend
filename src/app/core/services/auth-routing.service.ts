import { Injectable } from '@angular/core';
import { DASHBOARD_NAV_ITEMS } from '../constants/navigation.constants';
import { UserRole } from '../models/auth.model';
import { NavigationItem } from '../models/navigation.model';

@Injectable({ providedIn: 'root' })
export class AuthRoutingService {
  private readonly defaultRouteByRole: Record<UserRole, string> = {
    admin_hr: '/dashboard',
    employee: '/leave',
  };

  private readonly loginRouteByRole: Record<UserRole, string> = {
    admin_hr: '/login',
    employee: '/employee-login',
  };

  getDefaultRoute(role: UserRole | null | undefined): string {
    return role ? this.defaultRouteByRole[role] : '/login';
  }

  getLoginRoute(role: UserRole | null | undefined): string {
    return role ? this.loginRouteByRole[role] : '/login';
  }

  getNavigationItems(role: UserRole | null | undefined): NavigationItem[] {
    if (!role) {
      return [];
    }

    return DASHBOARD_NAV_ITEMS.filter((item) =>
      item.allowedRoles ? item.allowedRoles.includes(role) : true,
    );
  }

  isAllowedRole(role: UserRole, allowedRoles: readonly UserRole[]): boolean {
    return allowedRoles.includes(role);
  }
}
