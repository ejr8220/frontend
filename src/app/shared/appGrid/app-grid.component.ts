import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  GridModule,
  ToolbarItems,
  PageSettingsModel,
  FilterSettingsModel,
  FilterService,
  PageService,
  ToolbarService
} from '@syncfusion/ej2-angular-grids';
import {
  DialogModule,
  DialogComponent
} from '@syncfusion/ej2-angular-popups';
import {
  DataManager
} from '@syncfusion/ej2-data';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CustomUrlAdaptor } from '../adaptors/custom-url.adaptor';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, GridModule, RouterModule, DialogModule],
  templateUrl: './app-grid.component.html',
  styleUrls: ['./app-grid.component.scss'],
  providers: [FilterService, PageService, ToolbarService]
})
export class GridSharedComponent implements OnInit {
  @ViewChild('deleteDialog') deleteDialog?: DialogComponent;
  
  @Input() toolbar: any[] = [];
  @Input() allowPaging = true;
  @Input() height: string = '600px';
  @Input() allowFiltering = true;
  @Input() urlData!: string;
  @Input() urlEdit!: string;
  @Input() urlDelete!: string;
  @Input() columns: any[] = [];
  @Input() showPrintAction = false;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onPrint = new EventEmitter<any>();

  public dataSource: any;
  public pageSettings: PageSettingsModel = { 
    pageSize: 10
  };
  public filterSettings: FilterSettingsModel = { type: 'Menu' };
  
  public deleteDialogVisible = false;
  public rowToDelete: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.urlData && this.columns && this.columns.length > 0) {
      this.initializeDataSource();
    }
  }

  initializeDataSource(): void {
    this.dataSource = new DataManager({
      url: this.urlData,
      adaptor: new CustomUrlAdaptor(),
      crossDomain: true
    });
  }

  handleToolbarClick(args: any): void {
    if (args.item.id === 'Add') {
      this.router.navigate([this.urlEdit]);
      this.onAdd.emit();
    } else if (args.item.id === 'Refresh') {
      this.refreshGrid();
    }
  }

  confirmDelete(row: any): void {
    this.rowToDelete = row;
    this.deleteDialogVisible = true;
  }

  onDeleteConfirm = (): void => {
    if (this.rowToDelete) {
      const deleteUrl = `${this.urlDelete}/${this.rowToDelete.id}`;
      fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => {
          this.onDelete.emit(this.rowToDelete);
          this.deleteDialogVisible = false;
          this.rowToDelete = null;
          this.refreshGrid();
        })
        .catch(err => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el registro');
        })
        .finally(() => {
          if (this.deleteDialog) {
            this.deleteDialog.hide();
          }
        });
    }
  }

  onDeleteCancel = (): void => {
    this.deleteDialogVisible = false;
    this.rowToDelete = null;
    if (this.deleteDialog) {
      this.deleteDialog.hide();
    }
  }

  editRow(row: any): void {
    this.router.navigate([this.urlEdit, row.id]);
    this.onEdit.emit(row);
  }

  printRow(row: any): void {
    this.onPrint.emit(row);
  }

  refreshGrid(): void {
    this.initializeDataSource();
    this.onRefresh.emit();
  }
}
