import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Company {
  id?: number;
  legalName: string;
  tradeName: string;
  identificationNumber: string;
  identificationType: any;
  address: string;
  phoneNumber: string;
  email: string;
  city: {
    id: number;
    name: string;
  };
  province: {
    id: number;
    name: string;
  };
  country: {
    id: number;
    name: string;
  };
  pfxRoute?: string;
  pfxKey?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.api.url}${environment.api.pathCompany}`;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<Company[]> {
    const headers = this.buildHeaders();
    return this.http.get<Company[]>(this.apiUrl, { headers });
  }

  getCompanyById(id: number): Observable<Company> {
    const headers = this.buildHeaders();
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers });
  }

  createCompany(company: Company): Observable<Company> {
    const headers = this.buildHeaders();
    return this.http.post<Company>(this.apiUrl, company, { headers });
  }

  updateCompany(id: number, company: Company): Observable<Company> {
    const headers = this.buildHeaders();
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company, { headers });
  }

  uploadPfxCertificate(file: File): Observable<{ route: string; fileName: string }> {
    const headers = this.buildHeaders();
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ route: string; fileName: string }>(`${this.apiUrl}/upload-pfx`, formData, { headers });
  }

  deleteCompany(id: number): Observable<void> {
    const headers = this.buildHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.getTokenFromCookie();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getTokenFromCookie(): string {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'authToken') {
        return decodeURIComponent(value);
      }
    }
    return '';
  }
}
