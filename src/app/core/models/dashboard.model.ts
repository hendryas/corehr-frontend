import { AppIconName } from '../../shared/types/app-icon-name.type';

export interface DashboardStat {
  label: string;
  value: string;
  delta: string;
  accent: 'blue' | 'green' | 'gold' | 'info';
  icon: AppIconName;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  role: string;
  department: string;
  location: string;
  status: 'Active' | 'Onboarding' | 'Remote';
  startDate: string;
}

export interface QuickAction {
  title: string;
  description: string;
  actionLabel: string;
  icon: AppIconName;
  kind: 'modal' | 'ghost';
}
