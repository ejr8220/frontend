import { Routes } from '@angular/router';

export const generalRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];
