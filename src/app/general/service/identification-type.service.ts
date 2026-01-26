import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IdentificationType {
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdentificationTypeService {
  private apiUrl = `${environment.api.url}${environment.api.pathIdentificationType}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<IdentificationType[]> {
    const headers = this.buildHeaders();
    return this.http.get<IdentificationType[]>(this.apiUrl, { headers });
  }

  getById(id: number): Observable<IdentificationType> {
    const headers = this.buildHeaders();
    return this.http.get<IdentificationType>(`${this.apiUrl}/${id}`, { headers });
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
