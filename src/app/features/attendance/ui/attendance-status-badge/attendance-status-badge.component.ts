import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Badge } from 'flowbite-angular/badge';
import { AttendanceStatus } from '../../domain/models/attendance.model';

@Component({
  selector: 'app-attendance-status-badge',
  standalone: true,
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span flowbiteBadge pill [color]="badgeColor()" class="!rounded-full !px-3 !py-1.5">
      {{ label() }}
    </span>
  `,
})
export class AttendanceStatusBadgeComponent {
  readonly status = input.required<AttendanceStatus>();

  protected badgeColor() {
    switch (this.status()) {
      case 'present':
        return 'success' as const;
      case 'sick':
        return 'info' as const;
      case 'leave':
        return 'primary' as const;
      default:
        return 'warning' as const;
    }
  }

  protected label(): string {
    switch (this.status()) {
      case 'present':
        return 'Present';
      case 'sick':
        return 'Sick';
      case 'leave':
        return 'Leave';
      default:
        return 'Absent';
    }
  }
}
