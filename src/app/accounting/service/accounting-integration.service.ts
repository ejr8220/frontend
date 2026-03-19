import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DownloadRcvRequest {
  companyId: number;
  year: number;
  month: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingIntegrationService {
  private readonly importadorUrl = environment.api.importadorUrl;

  constructor(private http: HttpClient) {}

  descargarCompras(payload: DownloadRcvRequest): Observable<any> {
    return this.http.post<any>(
      `${this.importadorUrl}${environment.api.pathImportadorCompras}`,
      payload
    );
  }

  descargarVentas(payload: DownloadRcvRequest): Observable<any> {
    return this.http.post<any>(
      `${this.importadorUrl}${environment.api.pathImportadorVentas}`,
      payload
    );
  }
}
