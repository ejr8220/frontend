import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CurrentCompany {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanySessionService {
  private readonly STORAGE_KEY = 'currentCompany';
  private currentCompanySubject = new BehaviorSubject<CurrentCompany | null>(this.getStoredCompany());

  currentCompany$: Observable<CurrentCompany | null> = this.currentCompanySubject.asObservable();

  constructor() {}

  setCurrentCompany(company: CurrentCompany): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(company));
    this.currentCompanySubject.next(company);
  }

  getCurrentCompany(): CurrentCompany | null {
    return this.currentCompanySubject.value;
  }

  getStoredCompany(): CurrentCompany | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  clearCompany(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentCompanySubject.next(null);
  }
}
