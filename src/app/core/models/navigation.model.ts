import { AppIconName } from '../../shared/types/app-icon-name.type';

export interface NavigationItem {
  label: string;
  route: string;
  icon: AppIconName;
  disabled?: boolean;
}
