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
  },
  {
    path: 'journal',
    loadComponent: () =>
      import('./journal/journal.component').then(m => m.JournalComponent)
  },
  {
    path: 'journal/crud',
    loadComponent: () =>
      import('./journal/crud/crud_journal.component').then(m => m.CrudJournalComponent)
  },
  {
    path: 'journal/crud/:id',
    loadComponent: () =>
      import('./journal/crud/crud_journal.component').then(m => m.CrudJournalComponent)
  },
  {
    path: 'accounting-integration',
    loadComponent: () =>
      import('./accounting-integration/accounting-integration.component').then(m => m.AccountingIntegrationComponent)
  },
  {
    path: 'accounting-configuration',
    loadComponent: () =>
      import('./accounting-configuration/accounting-configuration.component').then(m => m.AccountingConfigurationComponent)
  },
  {
    path: 'reports/balance-general-8-columnas',
    loadComponent: () =>
      import('./reports/report-host.component').then(m => m.ReportHostComponent),
    data: { reportTitle: 'Balance General de 8 Columnas', rdlFile: 'BalanceGeneral8C.rdl' }
  },
  {
    path: 'reports/balance-comprobacion',
    loadComponent: () =>
      import('./reports/report-host.component').then(m => m.ReportHostComponent),
    data: { reportTitle: 'Balance de Comprobación', rdlFile: 'TrialBalance.rdl' }
  },
  {
    path: 'reports/asientos-diario',
    loadComponent: () =>
      import('./reports/journal-report-params.component').then(m => m.JournalReportParamsComponent)
  },
  {
    path: 'reports/libro-mayor',
    loadComponent: () =>
      import('./reports/report-host.component').then(m => m.ReportHostComponent),
    data: { reportTitle: 'Libro Mayor', rdlFile: 'GeneralLedger.rdl' }
  }
];
