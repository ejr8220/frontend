export const environment = {
  production: false,
  api: {
    url: 'http://localhost:5096',
    pathAuth: '/api/Auth/login',
    pathCompany: '/api/general/Company',
    pathCompanyGetAllFilter: '/api/general/Company/GetAllFilter',
    pathIdentificationType: '/api/general/IdentificationType',
    pathCountry: '/api/general/Country'
  }
};
/* For easier debugging in development mode, you can import the following file
 to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.   */