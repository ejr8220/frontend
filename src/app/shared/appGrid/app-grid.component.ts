import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  GridModule,
  ToolbarItems,
  EditSettingsModel,
  PageSettingsModel,
  FilterSettingsModel,
  SelectionSettingsModel
} from '@syncfusion/ej2-angular-grids';
import {
  DataManager,
  WebApiAdaptor,
  WebApiCustomAdaptor
} from '@syncfusion/ej2-data';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, GridModule, RouterModule],
  templateUrl: './app-grid.component.html',
  styleUrls: ['./app-grid.component.scss']
})
export class GridSharedComponent {
  @Input() toolbar: ToolbarItems[] = ['Add', 'Print', 'Refresh'];
  @Input() selectionMode: 'Single' | 'Multiple' = 'Single';
  @Input() allowPaging = true;
  @Input() height: string = '500px';
  @Input() allowFiltering = true;
  @Input() urlData!: string;
  @Input() urlEdit!: string;
  @Input() urlDelete!: string;
  @Input() columns: any[] = [];

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();

  public dataSource!: DataManager;
  public pageSettings: PageSettingsModel = { pageSize: 10 };
  public filterSettings: FilterSettingsModel = { type: 'Menu' };
  public selectionSettings: SelectionSettingsModel = {
    type: this.selectionMode
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.dataSource = new DataManager({
      url: this.urlData,
      adaptor: new WebApiCustomAdaptor(),
      crossDomain: true
    });
  }

  handleToolbarClick(args: any): void {
    switch (args.item.id) {
      case 'Add':
        this.router.navigate([this.urlEdit]);
        this.onAdd.emit();
        break;
      case 'Print':
        // grid.print() no disponible directamente, usar workaround si necesario
        break;
      case 'Refresh':
        this.dataSource = new DataManager({
          url: this.urlData,
          adaptor: new WebApiCustomAdaptor(),
          crossDomain: true
        });
        this.onRefresh.emit();
        break;
    }
  }

  confirmDelete(row: any): void {
    if (confirm('¿Desea eliminar este registro?')) {
      fetch(this.urlDelete, {
        method: 'POST',
        body: JSON.stringify({ id: row.id }),
        headers: { 'Content-Type': 'application/json' }
      }).then(() => {
        this.onDelete.emit(row);
        this.handleToolbarClick({ item: { id: 'Refresh' } });
      });
    }
  }

  editRow(row: any): void {
    this.router.navigate([this.urlEdit, row.id]);
    this.onEdit.emit(row);
  }
}