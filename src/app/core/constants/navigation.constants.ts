import { NavigationItem } from '../models/navigation.model';

export const DASHBOARD_NAV_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', allowedRoles: ['admin_hr'] },
  { label: 'Employees', route: '/employees', icon: 'employees', allowedRoles: ['admin_hr'] },
  {
    label: 'Attendance',
    route: '/attendance',
    icon: 'attendance',
    allowedRoles: ['admin_hr', 'employee'],
  },
  { label: 'Leave', route: '/leave', icon: 'leave', allowedRoles: ['admin_hr', 'employee'] },
  {
    label: 'Organization',
    route: '/organization',
    icon: 'briefcase',
    allowedRoles: ['admin_hr'],
  },
  {
    label: 'Payroll',
    route: '/dashboard/payroll',
    icon: 'payroll',
    disabled: true,
    allowedRoles: ['admin_hr'],
  },
  {
    label: 'Settings',
    route: '/dashboard/settings',
    icon: 'settings',
    disabled: true,
    allowedRoles: ['admin_hr'],
  },
];
