import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PositionListItem } from '../../domain/models/organization.model';

@Component({
  selector: 'app-positions-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Positions</h2>
          <p class="mt-1 muted-copy">Manage position records and their department assignments.</p>
        </div>
        <div class="rounded-2xl border border-brand-blue/15 bg-brand-blue/6 px-4 py-3 text-sm font-semibold text-brand-blue">
          {{ positions().length }} positions
        </div>
      </div>

      <div class="mt-5 hidden overflow-x-auto xl:block">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Position</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Department</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Description</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Updated</th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (position of positions(); track position.id) {
              <tr class="align-top shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
                <td class="rounded-l-2xl border-y border-l border-ui-border bg-ui-surface px-4 py-4 text-sm font-semibold text-ui-text">
                  {{ position.name }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ position.departmentName }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-muted">
                  {{ position.descriptionLabel }}
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4">
                  <span class="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1.5 text-sm font-semibold text-brand-green">
                    {{ position.statusLabel }}
                  </span>
                </td>
                <td class="border-y border-ui-border bg-ui-surface px-4 py-4 text-sm text-ui-text">
                  {{ position.updatedAtLabel }}
                </td>
                <td class="rounded-r-2xl border-y border-r border-ui-border bg-ui-surface px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" class="table-action text-ui-text" (click)="editPosition.emit(position.id)">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="table-action text-danger"
                      [disabled]="deletingPositionId() === position.id"
                      (click)="deletePosition.emit(position)"
                    >
                      {{ deletingPositionId() === position.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-5 grid gap-4 xl:hidden">
        @for (position of positions(); track position.id) {
          <article class="rounded-[26px] border border-ui-border bg-ui-bg/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-ui-text">{{ position.name }}</h3>
                <p class="mt-1 text-sm text-ui-muted">{{ position.departmentName }}</p>
              </div>
              <span class="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1.5 text-sm font-semibold text-brand-green">
                {{ position.statusLabel }}
              </span>
            </div>

            <p class="mt-4 text-sm text-ui-muted">{{ position.descriptionLabel }}</p>
            <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Updated</p>
            <p class="mt-1 text-sm font-medium text-ui-text">{{ position.updatedAtLabel }}</p>

            <div class="mt-5 flex flex-wrap gap-3 border-t border-ui-border pt-4">
              <button type="button" class="table-action text-ui-text" (click)="editPosition.emit(position.id)">
                Edit
              </button>
              <button
                type="button"
                class="table-action text-danger"
                [disabled]="deletingPositionId() === position.id"
                (click)="deletePosition.emit(position)"
              >
                {{ deletingPositionId() === position.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class PositionsTableComponent {
  readonly positions = input.required<PositionListItem[]>();
  readonly deletingPositionId = input<number | null>(null);

  readonly editPosition = output<number>();
  readonly deletePosition = output<PositionListItem>();
}
