import { Routes } from '@angular/router';
import { AuthGuard } from './Auth/auth.guard';
import { generalRoutes } from './general/general.routes';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./Auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./general/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
