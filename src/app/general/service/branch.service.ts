import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  constructor(private http: HttpClient) {}

  getByCompany(companyId: number): Observable<any[]> {
    const url = `${environment.api.url}/api/general/Branch/getBranchByCompany/${companyId}`;
    return this.http.get<any[]>(url, { headers: this.buildHeaders() });
  }

  private buildHeaders(): HttpHeaders {
    const token = this.getTokenFromCookie();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
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
