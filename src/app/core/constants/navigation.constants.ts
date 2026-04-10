import { NavigationItem } from '../models/navigation.model';

export const DASHBOARD_NAV_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Employees', route: '/employees', icon: 'employees' },
  { label: 'Attendance', route: '/attendance', icon: 'attendance' },
  { label: 'Leave', route: '/leave', icon: 'leave' },
  { label: 'Payroll', route: '/dashboard/payroll', icon: 'payroll', disabled: true },
  { label: 'Settings', route: '/dashboard/settings', icon: 'settings', disabled: true },
];
