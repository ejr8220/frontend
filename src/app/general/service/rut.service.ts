import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rut {
  id?: number;
  identification: string;
  originalIdentification?: string;
  name: string;
  balance?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RutService {
  private readonly apiUrl = `${environment.api.url}/api/general/Rut`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Rut> {
    return this.http.get<Rut>(`${this.apiUrl}/${id}`, { headers: this.buildHeaders() });
  }

  create(payload: Rut): Observable<{ id?: number; Id?: number }> {
    return this.http.post<{ id?: number; Id?: number }>(this.apiUrl, payload, { headers: this.buildHeaders() });
  }

  update(id: number, payload: Rut): Observable<{ id?: number; Id?: number }> {
    return this.http.put<{ id?: number; Id?: number }>(`${this.apiUrl}/${id}`, payload, { headers: this.buildHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.buildHeaders() });
  }

  private buildHeaders(): HttpHeaders {
    const token = this.getTokenFromCookie();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  private getTokenFromCookie(): string {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'authToken') {
        return decodeURIComponent(value);
      }
    }
    return '';
  }
}
