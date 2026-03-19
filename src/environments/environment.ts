export const environment = {
  production: false,
  api: {
    url: 'http://localhost:5096',
    importadorUrl: 'http://localhost:5187',
    pathAuth: '/api/Auth/login',
    pathCompany: '/api/general/Company',
    pathCompanyGetAllFilter: '/api/general/Company/GetAllFilter',
    pathIdentificationType: '/api/general/IdentificationType',
    pathCountry: '/api/general/Country',
    pathAccountingConfigurationByCompany: '/api/accounting/AccountingConfiguration/company',
    pathAccountingConfigurationSave: '/api/accounting/AccountingConfiguration/save',
    pathImportadorCompras: '/api/SiiAuth/descargar-compras',
    pathImportadorVentas: '/api/SiiAuth/descargar-ventas'
  }
};
/* For easier debugging in development mode, you can import the following file
 to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.   */