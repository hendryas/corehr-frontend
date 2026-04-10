import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Badge } from 'flowbite-angular/badge';

@Component({
  selector: 'app-employee-status-badge',
  standalone: true,
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      flowbiteBadge
      pill
      [color]="isActive() ? 'success' : 'warning'"
      class="!rounded-full !px-3 !py-1.5"
    >
      {{ isActive() ? 'Active' : 'Inactive' }}
    </span>
  `,
})
export class EmployeeStatusBadgeComponent {
  readonly isActive = input.required<boolean>();
}
