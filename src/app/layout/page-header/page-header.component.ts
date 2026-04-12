import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-brand-blue/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
          <span class="h-2 w-2 rounded-full bg-brand-gold"></span>
          {{ eyebrow() }}
        </div>
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-ui-text sm:text-4xl">{{ title() }}</h1>
          <p class="max-w-3xl muted-copy">{{ description() }}</p>
        </div>
      </div>

      <div class="surface-card inline-flex items-center gap-3 px-4 py-3 text-sm font-medium text-ui-muted">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
          01
        </span>
        Review the latest updates and continue your work from here
      </div>
    </section>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('CoreHR CMS');
  readonly title = input.required<string>();
  readonly description = input('');
}
