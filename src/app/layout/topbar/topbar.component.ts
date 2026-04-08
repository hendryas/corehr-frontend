import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown, DropdownContent, DropdownItem } from 'flowbite-angular/dropdown';
import { NgpMenuTrigger } from 'ng-primitives/menu';
import { UserProfile } from '../../core/models/auth.model';
import { AppIconComponent } from '../../shared/ui/app-icon/app-icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, Dropdown, DropdownContent, DropdownItem, NgpMenuTrigger, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-ui-border/80 bg-ui-bg/90 backdrop-blur">
      <div class="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface text-ui-text shadow-sm transition hover:border-brand-blue/20 hover:text-brand-blue lg:hidden"
          (click)="menuToggle.emit()"
          aria-label="Open menu"
        >
          <app-icon name="menu" iconClass="h-5 w-5" />
        </button>

        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ui-muted">CoreHR dashboard</p>
          <h2 class="truncate text-lg font-bold text-ui-text">{{ pageTitle() }}</h2>
        </div>

        <div class="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-ui-border bg-ui-surface px-4 py-2.5 shadow-sm xl:flex">
          <app-icon name="search" iconClass="h-4 w-4 text-ui-muted" />
          <input
            type="search"
            placeholder="Search employees, attendance, payroll..."
            class="w-full border-none bg-transparent text-sm text-ui-text outline-none placeholder:text-ui-muted/70"
          />
        </div>

        <button
          type="button"
          class="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ui-border bg-ui-surface text-ui-text shadow-sm transition hover:border-brand-blue/20 hover:text-brand-blue"
          aria-label="Notifications"
        >
          <span class="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-danger"></span>
          <app-icon name="bell" iconClass="h-5 w-5" />
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-3 rounded-2xl border border-ui-border bg-ui-surface px-3 py-2 shadow-sm transition hover:border-brand-blue/20"
          [ngpMenuTrigger]="profileMenu"
          ngpMenuTriggerPlacement="bottom-end"
        >
          <div class="hidden text-right sm:block">
            <p class="text-sm font-semibold text-ui-text">{{ user()?.name ?? 'CoreHR Admin' }}</p>
            <p class="text-xs text-ui-muted">{{ user()?.role ?? 'Administrator' }}</p>
          </div>
          <div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-sm font-bold text-white">
            {{ user()?.initials ?? 'HR' }}
          </div>
        </button>

        <ng-template #profileMenu>
          <div flowbiteDropdown [customTheme]="dropdownTheme">
            <ul flowbiteDropdownContent [customTheme]="dropdownContentTheme">
              <li class="border-b border-ui-border/80 px-4 py-3">
                <p class="text-sm font-semibold text-ui-text">{{ user()?.name ?? 'CoreHR Admin' }}</p>
                <p class="mt-1 text-xs text-ui-muted">{{ user()?.email ?? 'admin@corehr.local' }}</p>
              </li>
              <li flowbiteDropdownItem>
                <a routerLink="/dashboard" class="block w-full text-left text-ui-text">Dashboard home</a>
              </li>
              <li flowbiteDropdownItem>
                <button type="button" class="w-full text-left text-ui-text">Profile settings</button>
              </li>
              <li flowbiteDropdownItem>
                <button
                  type="button"
                  class="inline-flex w-full items-center gap-2 text-left text-danger"
                  (click)="signOut.emit()"
                >
                  <app-icon name="logout" iconClass="h-4 w-4" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </ng-template>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly pageTitle = input('Dashboard overview');
  readonly user = input<UserProfile | null>(null);

  readonly menuToggle = output<void>();
  readonly signOut = output<void>();

  protected readonly dropdownTheme = {
    host: {
      base: 'w-64 overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-[0_24px_60px_-36px_rgba(15,23,42,0.32)]',
    },
  };

  protected readonly dropdownContentTheme = {
    host: {
      base: 'py-2 text-sm',
    },
  };
}
