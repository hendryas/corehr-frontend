import { AppIconName } from '../../shared/types/app-icon-name.type';
import { UserRole } from './auth.model';

export interface NavigationItem {
  label: string;
  route: string;
  icon: AppIconName;
  disabled?: boolean;
  allowedRoles?: readonly UserRole[];
}
