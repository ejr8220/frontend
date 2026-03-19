import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridComponent, GridModule, FilterService, PageService, SelectionService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-grid-search',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule],
  templateUrl: './grid-search.component.html',
  styleUrls: ['./grid-search.component.scss'],
  providers: [FilterService, PageService, SelectionService],
  host: { class: 'grid-search-container' }
})
export class GridSearchComponent implements OnInit, OnChanges {
  @Input() columns: any[] = [];
  @Input() method: string = '';
  @Input() params: any = {};
  @Input() requestType: 'GET' | 'POST' = 'GET';
  @Input() body: any = null;
  @Input() title: string = 'Registros Disponibles';

  toolbar: string[] = [];
  filterSettings: any = { type: 'FilterBar', mode: 'Immediate', operators: { stringOperator: 'contains' } };

  @Output() onSelect = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChild('gridSearch', { static: false }) grid!: GridComponent;

  recordList: any[] = [];
  isLoading = false;
  selectedRowIndex: number | null = null;
  displayColumns: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadRecords();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.initializeColumns();
    }

    if (changes['method'] || changes['params'] || changes['requestType'] || changes['body']) {
      this.loadRecords();
    }
  }

  initializeColumns(): void {
    // Agregar columna de checkbox primero
    const mappedColumns = (this.columns || []).map(col => ({
      ...col,
      filter: { operator: 'contains' }
    }));

    this.displayColumns = [
      {
        type: 'checkbox',
        width: 50,
        allowSorting: false,
        allowFiltering: false
      },
      ...mappedColumns
    ];
  }

  loadRecords(): void {
    if (!this.method) {
      console.error('Method URL no configurado');
      return;
    }

    this.isLoading = true;
    const token = this.getTokenFromCookie();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const options = {
      headers,
      params: this.params,
    };

    const request$ = this.requestType === 'POST'
      ? this.http.post<any>(this.method, this.body ?? {}, options)
      : this.http.get<any>(this.method, options);

    request$.subscribe({
      next: (response: unknown) => {
        const rawList = this.extractRecordsFromResponse(response);
        this.recordList = this.applyClientFilters(rawList);
        console.log('Records loaded:', this.recordList);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading records:', err);
        this.isLoading = false;
        this.recordList = [];
        this.cdr.detectChanges();
      },
    });
  }

  private extractRecordsFromResponse(response: unknown): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      const payload = response as { result?: unknown; data?: unknown };
      if (Array.isArray(payload.result)) {
        return payload.result;
      }
      if (payload.result && typeof payload.result === 'object') {
        return [payload.result];
      }
      if (Array.isArray(payload.data)) {
        return payload.data;
      }
      if (payload.data && typeof payload.data === 'object') {
        return [payload.data];
      }

      return [payload];
    }

    return [];
  }

  private applyClientFilters(records: any[]): any[] {
    if (!Array.isArray(records)) {
      return [];
    }

    let filtered = [...records];

    const companyId = Number(this.params?.companyId ?? 0);
    if (companyId > 0) {
      filtered = filtered.filter(item => {
        const itemCompanyId = Number(
          item?.companyId ??
          item?.CompanyId ??
          item?.company?.id ??
          item?.Company?.Id ??
          0
        );
        return itemCompanyId === companyId;
      });
    }

    if (this.params?.detailOnly === true) {
      filtered = filtered.filter(item => {
        const detailFlag = item?.isDetailAccount ?? item?.IsDetailAccount;
        return detailFlag === true || detailFlag === 1 || detailFlag === '1' || detailFlag === 'true';
      });
    }

    return filtered;
  }

  getTokenFromCookie(): string {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'authToken') {
        return decodeURIComponent(value);
      }
    }
    return '';
  }

  onRowSelected = (args: any): void => {
    if (args.rowIndex !== undefined) {
      this.selectedRowIndex = args.rowIndex;
      this.cdr.detectChanges();
    }
  };

  onRowDoubleClick = (args: any): void => {
    if (args.rowIndex !== undefined) {
      this.selectedRowIndex = args.rowIndex;
      this.selectRecord();
    }
  };

  onKeyDown = (args: any): void => {
    if (args.key === 'Enter' && this.selectedRowIndex !== null) {
      this.selectRecord();
    }
  };

  selectRecord(): void {
    if (this.selectedRowIndex !== null && this.recordList[this.selectedRowIndex]) {
      const selectedRecord = this.recordList[this.selectedRowIndex];
      this.onSelect.emit(selectedRecord);
    }
  }

  getSelectedRecord(): any {
    if (this.selectedRowIndex !== null && this.recordList[this.selectedRowIndex]) {
      return this.recordList[this.selectedRowIndex];
    }
    return null;
  }

  cancelSelection(): void {
    this.selectedRowIndex = null;
    this.onCancel.emit();
  }

  isRowSelected(rowIndex: number): boolean {
    return this.selectedRowIndex === rowIndex;
  }
}
