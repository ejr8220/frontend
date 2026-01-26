import { Component, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { GridSearchComponent } from '../grid-search/grid-search.component';

export interface SearchInputConfig {
  columns: any[];
  method: string;
  params: any;
  title?: string;
}

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TextBoxModule, ButtonModule, DialogModule, GridSearchComponent],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnChanges {
  @ViewChild('gridSearchDialog') gridSearchDialog?: DialogComponent;
  @ViewChildren(GridSearchComponent) gridSearchComponents!: QueryList<GridSearchComponent>;

  @Input() placeholder: string = 'Buscar...';
  @Input() displayField: string = 'name';
  @Input() searchConfig!: SearchInputConfig;
  @Input() initialValue: any = null;

  @Output() clearField = new EventEmitter<void>();
  @Output() selectedField = new EventEmitter<any>();

  searchValue: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && changes['initialValue'].currentValue) {
      const value = changes['initialValue'].currentValue;
      this.searchValue = value[this.displayField] || value.name || value || '';
    }
  }
  showGridSearch: boolean = false;

  openSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.searchConfig) {
      console.error('searchConfig no está configurado');
      return;
    }
    this.showGridSearch = true;
  }

  onClear(): void {
    this.searchValue = '';
    this.clearField.emit();
  }

  selectGridRecord(): void {
    console.log('selectGridRecord called');
    const gridSearch = this.gridSearchComponents?.first;
    console.log('gridSearch:', gridSearch);
    
    if (gridSearch) {
      console.log('selectedRowIndex:', gridSearch['selectedRowIndex']);
      const selectedRow = gridSearch.getSelectedRecord();
      console.log('selectedRow:', selectedRow);
      if (selectedRow) {
        this.onGridSearchSelect(selectedRow);
      } else {
        console.warn('No row selected in grid. Please select a row first.');
      }
    } else {
      console.error('Grid search component not found');
    }
  }

  onGridSearchSelect(selectedRecord: any): void {
    this.searchValue = selectedRecord[this.displayField] || selectedRecord.name || '';
    this.selectedField.emit(selectedRecord);
    this.showGridSearch = false;
    if (this.gridSearchDialog) {
      this.gridSearchDialog.hide();
    }
  }

  onGridSearchCancel(): void {
    this.showGridSearch = false;
    if (this.gridSearchDialog) {
      this.gridSearchDialog.hide();
    }
  }

  getButtonIcon(): string {
    return this.searchValue.trim() ? '✕' : '🔍';
  }

  onButtonClick(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.searchValue.trim()) {
      this.onClear();
    } else {
      this.openSearch(event);
    }
  }
}


