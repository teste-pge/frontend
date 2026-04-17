import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/passenger', pathMatch: 'full' },
  {
    path: 'passenger',
    loadComponent: () =>
      import('./features/passenger/components/ride-form/ride-form.component').then(
        (m) => m.RideFormComponent
      ),
  },
  {
    path: 'driver',
    loadComponent: () =>
      import(
        './features/driver/components/driver-dashboard/driver-dashboard.component'
      ).then((m) => m.DriverDashboardComponent),
  },
  { path: '**', redirectTo: '/passenger' },
];
