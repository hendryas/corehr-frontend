import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OrganizationStore } from '../../state/organization.store';

@Component({
  selector: 'app-organization-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (card of summaryCards(); track card.label) {
          <article class="surface-card relative overflow-hidden p-5 sm:p-6">
            <div class="absolute inset-x-0 top-0 h-1.5" [class]="card.barClass"></div>
            <div class="space-y-4">
              <p class="text-sm font-medium text-ui-muted">{{ card.label }}</p>
              <div>
                <h2 class="text-3xl font-bold text-ui-text">{{ card.value }}</h2>
                <p class="mt-2 text-sm font-semibold" [class]="card.deltaClass">{{ card.delta }}</p>
              </div>
            </div>
          </article>
        }
      </div>

      <section class="surface-card p-4 sm:p-5">
        <nav class="flex flex-wrap gap-3">
          <a
            routerLink="/organization/departments"
            routerLinkActive="bg-brand-blue text-white shadow-[0_18px_35px_-26px_rgba(31,111,178,0.65)]"
            class="rounded-2xl px-4 py-3 text-sm font-semibold text-ui-muted transition hover:bg-brand-blue/8 hover:text-brand-blue"
          >
            Departments
          </a>
          <a
            routerLink="/organization/positions"
            routerLinkActive="bg-brand-blue text-white shadow-[0_18px_35px_-26px_rgba(31,111,178,0.65)]"
            class="rounded-2xl px-4 py-3 text-sm font-semibold text-ui-muted transition hover:bg-brand-blue/8 hover:text-brand-blue"
          >
            Positions
          </a>
        </nav>
      </section>

      <router-outlet />
    </section>
  `,
})
export class OrganizationShellComponent {
  protected readonly store = inject(OrganizationStore);

  protected readonly summaryCards = computed(() => {
    const summary = this.store.summary();
    const isLoading = this.store.isSummaryLoading();

    return [
      {
        label: 'Total departments',
        value: isLoading ? '...' : String(summary.totalDepartments),
        delta: 'Current department records',
        barClass: 'bg-brand-blue',
        deltaClass: 'text-brand-blue',
      },
      {
        label: 'Active departments',
        value: isLoading ? '...' : String(summary.activeDepartments),
        delta: 'Available in the current structure',
        barClass: 'bg-brand-green',
        deltaClass: 'text-brand-green',
      },
      {
        label: 'Total positions',
        value: isLoading ? '...' : String(summary.totalPositions),
        delta: 'Current position records',
        barClass: 'bg-info',
        deltaClass: 'text-info',
      },
      {
        label: 'Active positions',
        value: isLoading ? '...' : String(summary.activePositions),
        delta: 'Available in the current structure',
        barClass: 'bg-brand-gold',
        deltaClass: 'text-brand-gold',
      },
    ];
  });

  constructor() {
    void this.store.loadOrganizationOverview();
  }
}
