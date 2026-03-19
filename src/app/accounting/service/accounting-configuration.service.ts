import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountingConfigurationService {
  private readonly apiUrl = environment.api.url;
  private readonly pathByCompany = environment.api.pathAccountingConfigurationByCompany;
  private readonly pathSave = environment.api.pathAccountingConfigurationSave;

  constructor(private http: HttpClient) {}

  getByCompany(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.pathByCompany}/${companyId}`);
  }

  save(configuration: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${this.pathSave}`, configuration);
  }
}
