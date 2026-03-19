import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GridSharedComponent } from '../../shared/appGrid/app-grid.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rut',
  standalone: true,
  imports: [CommonModule, RouterModule, GridSharedComponent],
  templateUrl: './rut.component.html',
  styleUrls: ['./rut.component.scss']
})
export class RutComponent implements OnInit {
  @ViewChild('rutGrid') rutGrid!: GridSharedComponent;

  toolbar: any[] = [
    { text: 'Add', prefixIcon: 'e-icons e-plus', id: 'Add' },
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];

  columns = [
    { field: 'id', headerText: 'ID', width: '80', textAlign: 'Right', visible: false },
    { field: 'identification', headerText: 'RUT', width: '180', textAlign: 'Left' },
    { field: 'name', headerText: 'Nombre', width: '260', textAlign: 'Left' },
    { field: 'balance', headerText: 'Saldo', width: '120', textAlign: 'Right' },
    { field: 'isActive', headerText: 'Activo', width: '100', textAlign: 'Center' }
  ];

  urlGetAll = `${environment.api.url}/api/general/Rut/GetAllFilter`;
  urlEdit = '/general/transacciones/rut/crud';
  urlDelete = `${environment.api.url}/api/general/Rut`;

  ngOnInit(): void {}

  onAdd(): void {}

  onEdit(_: any): void {}

  onDelete(_: any): void {}

  onRefresh(): void {
    if (this.rutGrid) {
      this.rutGrid.refreshGrid();
    }
  }
}
