import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { CompanySessionService } from '../shared/company-session.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: number;
    username: string;
    passwordHash: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    roles: {
      id: number;
      name: string;
      permissions: {
        id: number;
        code: string;
        description: string;
      }[];
    }[];
    companies: {
      id: number;
      cityId: number;
      provinceId: number;
      countryId: number;
      identificationTypeId: number;
      identificationNumber: string;
      legalName: string;
      tradeName: string;
      address: string;
      email: string;
      phoneNumber: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private companySessionService = inject(CompanySessionService);
  private apiUrl = `${environment.api.url}${environment.api.pathAuth}`;

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, payload).pipe(
      tap(res => {
        const expires = new Date(res.expiresAt);
        document.cookie = `token=${res.token};expires=${expires.toUTCString()};path=/`;
        document.cookie = `expiresAt=${res.expiresAt};expires=${expires.toUTCString()};path=/`;
        sessionStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  getToken(): string | null {
    return this.getCookie('token');
  }

  getTokenExpiration(): string | null {
    return this.getCookie('expiresAt');
  }

  getUser(): any {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'expiresAt=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    sessionStorage.removeItem('user');
    this.companySessionService.clearCompany();
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}