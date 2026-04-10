import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Badge } from 'flowbite-angular/badge';
import { LeaveRequestStatus } from '../../domain/models/leave.model';

@Component({
  selector: 'app-leave-status-badge',
  standalone: true,
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span flowbiteBadge pill [color]="badgeColor()" class="!rounded-full !px-3 !py-1.5">
      {{ label() }}
    </span>
  `,
})
export class LeaveStatusBadgeComponent {
  readonly status = input.required<LeaveRequestStatus>();

  protected badgeColor() {
    switch (this.status()) {
      case 'approved':
        return 'success' as const;
      case 'rejected':
        return 'failure' as const;
      default:
        return 'warning' as const;
    }
  }

  protected label(): string {
    switch (this.status()) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }
}
