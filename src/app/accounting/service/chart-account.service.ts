import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChartAccount {
  id: number;
  code: string;
  description: string;
  companyId: number;
  isAuxRequired: boolean;
  auxiliaryTypeId: number | null;
  auxiliaryType: string | null;
  isCostCenterRequired: boolean;
  isDetailAccount: boolean;
  isDocumentRequired: boolean;
  isClassifier1Required: boolean;
  classifier1TypeId: number | null;
  classifier1Type: string | null;
  isClassifier2Required: boolean;
  classifier2TypeId: number | null;
  classifier2Type: string | null;
  isBankReconciliation: boolean;
  isReferenceCurrencyEntry: boolean;
  isExchangeRateAdjustment: boolean;
  isActive: boolean;
  debtorSign: number;
  level: number;
  parentId: number;
  parentCode: string;
  children?: ChartAccount[];
}

export interface ChartAccountResponse {
  result: ChartAccount[];
}

export interface FilterRequest {
  page: number;
  pageSize: number;
  filters: any[];
  sorts: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartAccountService {
  private apiUrl = 'http://localhost:5096/api/accounting/ChartAccount';

  constructor(private http: HttpClient) {}

  getAllFilter(companyId: number, request?: FilterRequest): Observable<ChartAccountResponse> {
    const filterRequest: FilterRequest = request || {
      page: 1,
      pageSize: 100,
      filters: [],
      sorts: []
    };

    return this.http.post<ChartAccountResponse>(
      `${this.apiUrl}/GetAllFilter?companyId=${companyId}`,
      filterRequest
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

