import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JournalLine {
  journalId?: number;
  accountId: number;
  auxiliaryId: number | null;
  costCenterId: number | null;
  debit: number;
  credit: number;
  detail: string;
  createdAtUtc?: string;
  auxiliaryTypeId: number | null;
  type?: string;
  rut?: string;
  name?: string;
  documentType?: string;
  documentDate?: string;
  documentNumber?: string;
  isPosted?: boolean;
  account?: {
    id: number;
    name: string;
    code?: string;
    description?: string;
  };
  auxiliary?: any;
  costCenter?: any;
  id?: number;
}

export interface Journal {
  lines: JournalLine[];
  branchId: number | null;
  companyId: number;
  voucherTypeId: number;
  voucherName?: string;
  documentId: number | null;
  documentName?: string;
  description: string;
  createdAtUtc?: string;
  total?: number;
  documentNumber?: number;
  bookId: number;
  status?: number;
  isPosted?: boolean;
  isClone?: boolean;
  isClosed?: boolean;
  originalJournalId: number | null;
  branch?: {
    id: number;
    name: string;
  };
  company?: {
    id: number;
    name: string;
  };
  voucherType?: {
    id: number;
    name: string;
  };
  documentType?: any;
  book?: {
    id: number;
    name: string;
  };
  id?: number;
}

export interface VoucherTypeItem {
  id: number;
  voucherName: string;
}

export interface BookItem {
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = environment.api.url;

  constructor(private http: HttpClient) {}

  getAllJournals(companyId: number, skip: number = 0, take: number = 50): Observable<any> {
    const url = `${this.apiUrl}/api/accounting/Journal/GetAllFilter?companyId=${companyId}`;
    const body = {
      value: {
        skip: skip,
        take: take,
        requiresCounts: true
      }
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain'
    });

    return this.http.post<any>(url, body, { headers });
  }

  getJournalById(id: number): Observable<Journal> {
    return this.http.get<Journal>(`${this.apiUrl}/api/accounting/Journal/${id}`);
  }

  createJournal(journal: Journal): Observable<Journal> {
    return this.http.post<Journal>(`${this.apiUrl}/api/accounting/Journal`, journal);
  }

  updateJournal(id: number, journal: Journal): Observable<Journal> {
    return this.http.put<Journal>(`${this.apiUrl}/api/accounting/Journal/${id}`, journal);
  }

  deleteJournal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/accounting/Journal/${id}`);
  }

  postJournal(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/accounting/Journal/${id}/post`, {});
  }

  getVoucherTypes(): Observable<VoucherTypeItem[]> {
    return this.http.get<VoucherTypeItem[]>(`${this.apiUrl}/api/accounting/VoucherType`);
  }

  getBooks(): Observable<BookItem[]> {
    return this.http.get<BookItem[]>(`${this.apiUrl}/api/general/Book`);
  }

  getLastDocumentNumber(companyId: number, voucherTypeId: number): Observable<{ number: number }> {
    return this.http.get<{ number: number }>(
      `${this.apiUrl}/api/accounting/Journal/last-document-number?companyId=${companyId}&voucherTypeId=${voucherTypeId}`
    );
  }
}
