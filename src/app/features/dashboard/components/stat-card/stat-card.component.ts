import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardStat } from '../../../../core/models/dashboard.model';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="surface-card relative overflow-hidden p-5 sm:p-6">
      <div class="absolute inset-x-0 top-0 h-1.5" [class]="accentBarClass()"></div>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-4">
          <p class="text-sm font-medium text-ui-muted">{{ stat().label }}</p>
          <div>
            <h3 class="text-3xl font-bold text-ui-text">{{ stat().value }}</h3>
            <p class="mt-2 text-sm font-semibold" [class]="deltaClass()">{{ stat().delta }}</p>
          </div>
        </div>

        <div class="flex h-12 w-12 items-center justify-center rounded-2xl" [class]="accentSurfaceClass()">
          <app-icon [name]="stat().icon" iconClass="h-5 w-5" />
        </div>
      </div>
    </article>
  `,
})
export class StatCardComponent {
  readonly stat = input.required<DashboardStat>();

  protected readonly accentBarClass = computed(() => this.accentClasses().bar);
  protected readonly accentSurfaceClass = computed(() => this.accentClasses().surface);
  protected readonly deltaClass = computed(() => this.accentClasses().delta);

  private accentClasses() {
    const accent = this.stat().accent;

    switch (accent) {
      case 'green':
        return {
          bar: 'bg-brand-green',
          surface: 'bg-brand-green/12 text-brand-green',
          delta: 'text-brand-green',
        };
      case 'gold':
        return {
          bar: 'bg-brand-gold',
          surface: 'bg-brand-gold/12 text-brand-gold',
          delta: 'text-brand-gold',
        };
      case 'info':
        return {
          bar: 'bg-info',
          surface: 'bg-info/12 text-info',
          delta: 'text-info',
        };
      default:
        return {
          bar: 'bg-brand-blue',
          surface: 'bg-brand-blue/12 text-brand-blue',
          delta: 'text-brand-blue',
        };
    }
  }
}
