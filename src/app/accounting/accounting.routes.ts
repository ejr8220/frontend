import { Routes } from '@angular/router';

export const accountingRoutes: Routes = [
  {
    path: 'chart-account',
    loadComponent: () =>
      import('./chart-account/chart-account.component').then(m => m.ChartAccountComponent)
  },
  {
    path: 'chart-account/crud',
    loadComponent: () =>
      import('./chart-account/crud/crud_chart_account.component').then(m => m.CrudChartAccountComponent)
  },
  {
    path: 'chart-account/crud/:id',
    loadComponent: () =>
      import('./chart-account/crud/crud_chart_account.component').then(m => m.CrudChartAccountComponent)
  }
];
