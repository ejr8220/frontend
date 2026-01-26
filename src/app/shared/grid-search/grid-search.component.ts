import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
export class GridSearchComponent implements OnInit {
  @Input() columns: any[] = [];
  @Input() method: string = '';
  @Input() params: any = {};
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

  initializeColumns(): void {
    // Agregar columna de checkbox primero
    const mappedColumns = this.columns.map(col => ({
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

    this.http
      .get<any>(this.method, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: this.params,
      })
      .subscribe({
        next: (response) => {
          this.recordList = response.result || response.data || response || [];
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
