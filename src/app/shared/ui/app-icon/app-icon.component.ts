import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconName } from '../../types/app-icon-name.type';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('dashboard') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('employees') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 20a5 5 0 0 1 10 0M14 20a4 4 0 0 1 6 0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('attendance') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 7v5l3 2.5M6 3v3M18 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('leave') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 21c4.418 0 8-3.358 8-7.5S16.418 6 12 6 4 9.358 4 13.5 7.582 21 12 21Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9 3c.8 2.3 2.1 3.5 4 3.5S16.2 5.3 17 3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('payroll') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 9h16M8 14h4M8 16.5h2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('settings') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="m19.4 15-.8 1.4 1.1 1.9-2.1 2.1-1.9-1.1-1.4.8-.5 2.2h-3l-.5-2.2-1.4-.8-1.9 1.1-2.1-2.1 1.1-1.9-.8-1.4-2.2-.5v-3l2.2-.5.8-1.4-1.1-1.9 2.1-2.1 1.9 1.1 1.4-.8.5-2.2h3l.5 2.2 1.4.8 1.9-1.1 2.1 2.1-1.1 1.9.8 1.4 2.2.5v3l-2.2.5Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('search') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="m20 20-3.5-3.5M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('bell') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M6 10a6 6 0 1 1 12 0v4l1.5 2H4.5L6 14v-4Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('menu') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('logout') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M10 17 15 12 10 7M15 12H4M20 4v16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('eye') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
      @case ('eye-off') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M3 3 21 21" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M10.6 10.7A3 3 0 0 0 13.3 13.4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9.9 5.1A11 11 0 0 1 12 5c6 0 9.5 7 9.5 7a15.6 15.6 0 0 1-4 4.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.2 6.3A15.3 15.3 0 0 0 2.5 12s3.5 7 9.5 7a10.7 10.7 0 0 0 3-.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('trend') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="m4 15 5-5 4 4 7-7M15 7h5v5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('sparkles') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14ZM6 14l.9 2.1L9 17l-2.1.9L6 20l-.9-2.1L3 17l2.1-.9L6 14Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('announcement') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M5 14V9a2 2 0 0 1 2-2h2l8-3v16l-8-3H7a2 2 0 0 1-2-2Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9 17v3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('upload') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 19h14" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('download') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 5v11M16.5 11.5 12 16l-4.5-4.5M5 19h14" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('briefcase') {
        <svg [class]="iconClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 13h16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
    }
  `,
})
export class AppIconComponent {
  readonly name = input.required<AppIconName>();
  readonly iconClass = input('h-5 w-5');
}
