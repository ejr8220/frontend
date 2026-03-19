import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ParameterDetail {
  id: number;
  code: string;
  value: string;
  description: string;
}

export interface ParameterHeader {
  id: number;
  name: string;
  code: string;
  isGlobal: boolean;
  companyId: number | null;
  nameCompany: string | null;
  details: ParameterDetail[];
}

export interface FilterRequest {
  page: number;
  pageSize: number;
  filters: any[];
  sorts: any[];
}

export interface ParameterResponse {
  result: ParameterHeader[];
}

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  private apiUrl = `${environment.api.url}/api/general/ParameterHeader`;

  constructor(private http: HttpClient) {}

  getAllFilter(request?: FilterRequest): Observable<ParameterResponse> {
    const filterRequest: FilterRequest = request || {
      page: 1,
      pageSize: 100,
      filters: [],
      sorts: []
    };

    return this.http.post<ParameterResponse>(
      `${this.apiUrl}/GetAllFilter`,
      filterRequest
    );
  }

  getById(id: number): Observable<ParameterHeader> {
    return this.http.get<ParameterHeader>(`${this.apiUrl}/${id}`);
  }

  create(data: ParameterHeader): Observable<ParameterHeader> {
    return this.http.post<ParameterHeader>(`${this.apiUrl}`, data);
  }

  update(id: number, data: ParameterHeader): Observable<ParameterHeader> {
    return this.http.put<ParameterHeader>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
