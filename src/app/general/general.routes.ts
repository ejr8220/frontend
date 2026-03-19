import { Routes } from '@angular/router';

export const generalRoutes: Routes = [
  {
    path: 'company',
    loadComponent: () =>
      import('./company/company.component').then(m => m.CompanyComponent)
  },
  {
    path: 'company/crud',
    loadComponent: () =>
      import('./company/crud_company.component').then(m => m.CrudCompanyComponent)
  },
  {
    path: 'company/crud/:id',
    loadComponent: () =>
      import('./company/crud_company.component').then(m => m.CrudCompanyComponent)
  },
  {
    path: 'master/parametros',
    loadComponent: () =>
      import('./parameter/parameter.component').then(m => m.ParameterComponent)
  },
  {
    path: 'master/parametros/crud',
    loadComponent: () =>
      import('./parameter/crud/crud_parameter.component').then(m => m.CrudParameterComponent)
  },
  {
    path: 'master/parametros/crud/:id',
    loadComponent: () =>
      import('./parameter/crud/crud_parameter.component').then(m => m.CrudParameterComponent)
  },
  {
    path: 'master/branches',
    loadComponent: () =>
      import('./branch/branch.component').then(m => m.BranchComponent)
  },
  {
    path: 'transacciones/rut',
    loadComponent: () =>
      import('./rut/rut.component').then(m => m.RutComponent)
  },
  {
    path: 'transacciones/rut/crud',
    loadComponent: () =>
      import('./rut/crud/crud_rut.component').then(m => m.CrudRutComponent)
  },
  {
    path: 'transacciones/rut/crud/:id',
    loadComponent: () =>
      import('./rut/crud/crud_rut.component').then(m => m.CrudRutComponent)
  }
];

