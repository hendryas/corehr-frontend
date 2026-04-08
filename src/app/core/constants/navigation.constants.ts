import { NavigationItem } from '../models/navigation.model';

export const DASHBOARD_NAV_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Employees', route: '/dashboard/employees', icon: 'employees', disabled: true },
  { label: 'Attendance', route: '/dashboard/attendance', icon: 'attendance', disabled: true },
  { label: 'Leave', route: '/dashboard/leave', icon: 'leave', disabled: true },
  { label: 'Payroll', route: '/dashboard/payroll', icon: 'payroll', disabled: true },
  { label: 'Settings', route: '/dashboard/settings', icon: 'settings', disabled: true },
];
