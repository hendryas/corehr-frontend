import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

describe('Runtime smoke', () => {
  it('creates the dashboard home component', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardHomeComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('creates the topbar component', async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.componentRef.setInput('pageTitle', 'Dashboard overview');
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('creates the dashboard layout component', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {} },
            firstChild: null,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
