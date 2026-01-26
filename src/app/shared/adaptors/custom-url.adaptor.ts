import { DataManager, Query, UrlAdaptor } from '@syncfusion/ej2-data';

export class CustomUrlAdaptor extends UrlAdaptor {
  read(dm: any, query?: any): Promise<any> {
    const url = dm.url || dm.crudUrl?.read;
    
    // Construir el cuerpo de la solicitud con los parámetros del grid
    const body: any = {
      skip: 0,
      take: 10,
      requiresCounts: true,
      sorted: [],
      search: [],
      where: [],
      aggregates: []
    };
    
    // Agregar parámetros de filtro, ordenamiento y paginación si existen
    if (query) {
      // Pasar la query tal como está para que el servidor la maneje
      body.query = query;
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Transformar la respuesta al formato esperado por Syncfusion
        // Aplanar los campos anidados para que el grid pueda accederlos
        const transformedResult = (data.result || []).map((item: any) => ({
          ...item,
          cityName: item.city?.name || item.cityName || '-',
          countryName: item.country?.name || item.countryName || '-',
          provinceName: item.province?.name || item.provinceName || '-'
        }));
        
        console.log('Datos transformados:', transformedResult);
        
        return {
          result: transformedResult,
          count: data.count || 0
        };
      })
      .catch(error => {
        console.error('Error en lectura de datos:', error);
        throw error;
      });
  }
}


