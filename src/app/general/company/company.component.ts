import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GridSharedComponent } from '../../shared/appGrid/app-grid.component';
import { CompanyService, Company } from '../service/company.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, RouterModule, GridSharedComponent],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
  @ViewChild('companyGrid') companyGrid!: GridSharedComponent;
  
  toolbar: any[] = [
    { text: 'Add', prefixIcon: 'e-icons e-plus', id: 'Add' },
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];
  
  columns = [
    { 
      field: 'id', 
      headerText: 'ID', 
      width: '80', 
      textAlign: 'Right',
      visible: false
    },
    { 
      field: 'legalName', 
      headerText: 'Razón Social', 
      width: '200', 
      textAlign: 'Left'
    },
    { 
      field: 'tradeName', 
      headerText: 'Nombre Comercial', 
      width: '180', 
      textAlign: 'Left'
    },
    { 
      field: 'identificationNumber', 
      headerText: 'RUT', 
      width: '120', 
      textAlign: 'Left'
    },
    { 
      field: 'email', 
      headerText: 'Email', 
      width: '150', 
      textAlign: 'Left'
    },
    { 
      field: 'phoneNumber', 
      headerText: 'Teléfono', 
      width: '120', 
      textAlign: 'Left'
    },
    { 
      field: 'cityName', 
      headerText: 'Ciudad', 
      width: '120', 
      textAlign: 'Left'
    },
    { 
      field: 'countryName', 
      headerText: 'País', 
      width: '120', 
      textAlign: 'Left'
    }
  ];

  urlGetAll = `${environment.api.url}${environment.api.pathCompanyGetAllFilter}`;
  urlEdit = '/general/company/crud';
  urlDelete = `${environment.api.url}${environment.api.pathCompany}`;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => {
        console.log('Empresas cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }

  onAdd(): void {
    console.log('Agregar nueva empresa');
  }

  onEdit(company: Company): void {
    console.log('Editar empresa:', company);
  }

  onDelete(company: Company): void {
    console.log('Empresa eliminada:', company);
    this.loadCompanies();
  }

  onRefresh(): void {
    console.log('Refrescando listado de empresas');
    if (this.companyGrid) {
      this.companyGrid.refreshGrid();
    }
    this.loadCompanies();
  }
}
