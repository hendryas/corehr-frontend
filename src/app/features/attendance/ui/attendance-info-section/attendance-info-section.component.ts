import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttendanceSectionItem } from '../../domain/models/attendance.model';

@Component({
  selector: 'app-attendance-info-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card p-6">
      <div class="border-b border-ui-border pb-4">
        <h2 class="text-xl font-bold text-ui-text">{{ title() }}</h2>
        @if (description()) {
          <p class="mt-1 muted-copy">{{ description() }}</p>
        }
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (item of items(); track item.label) {
          <div class="rounded-[24px] border border-ui-border/80 bg-ui-bg/70 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">{{ item.label }}</p>
            <p class="mt-2 text-sm font-semibold text-ui-text">{{ item.value }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class AttendanceInfoSectionComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly items = input.required<AttendanceSectionItem[]>();
}
