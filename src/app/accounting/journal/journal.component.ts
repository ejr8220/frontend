import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GridSharedComponent } from '../../shared/appGrid/app-grid.component';
import { JournalService, Journal } from '../service/journal.service';
import { environment } from '../../../environments/environment';
import { CompanySessionService } from '../../shared/company-session.service';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, RouterModule, GridSharedComponent],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {
  @ViewChild('journalGrid') journalGrid!: GridSharedComponent;
  showToast = false;
  toastMessage = '';
  companyId = 0;
  
  toolbar: any[] = [
    { text: 'Add', prefixIcon: 'e-icons e-plus', id: 'Add' },
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];
  
  columns = [
    { 
      field: 'id', 
      headerText: 'ID', 
      width: '80', 
      textAlign: 'Right'
    },
    { 
      field: 'documentNumber', 
      headerText: 'N° Documento', 
      width: '120', 
      textAlign: 'Right'
    },
    { 
      field: 'voucherName', 
      headerText: 'Tipo de Comprobante', 
      width: '180', 
      textAlign: 'Left'
    },
    { 
      field: 'description', 
      headerText: 'Descripción', 
      width: '250', 
      textAlign: 'Left'
    },
    { 
      field: 'createdAtUtc', 
      headerText: 'Fecha', 
      width: '140', 
      textAlign: 'Left',
      type: 'date',
      format: 'dd/MM/yyyy'
    },
    { 
      field: 'total', 
      headerText: 'Total', 
      width: '130', 
      textAlign: 'Right',
      format: 'N0'
    },
    { 
      field: 'isPosted', 
      headerText: 'Contabilizado', 
      width: '120', 
      textAlign: 'Center',
      displayAsCheckBox: true
    },
    { 
      field: 'branch.name', 
      headerText: 'Sucursal', 
      width: '150', 
      textAlign: 'Left'
    }
  ];

  urlGetAll = `${environment.api.url}/api/accounting/Journal/GetAllFilter?companyId=0`;
  urlEdit = '/accounting/journal/crud';
  urlDelete = `${environment.api.url}/api/accounting/Journal`;

  constructor(
    private journalService: JournalService,
    private companySessionService: CompanySessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentCompany = this.companySessionService.getCurrentCompany();
    this.companyId = currentCompany?.id ?? 0;
    this.urlGetAll = `${environment.api.url}/api/accounting/Journal/GetAllFilter?companyId=${this.companyId}`;

    const message = history.state?.toastMessage;
    if (message) {
      this.showSuccessToast(message);
      history.replaceState({}, document.title);
    }

    this.loadJournals();
  }

  loadJournals(): void {
    this.journalService.getAllJournals(this.companyId).subscribe({
      next: (data) => {
        console.log('Diarios cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar diarios:', error);
      }
    });
  }

  onAdd(): void {
    console.log('Agregar nuevo diario contable');
  }

  onEdit(journal: Journal): void {
    console.log('Editar diario:', journal);
  }

  onDelete(journal: Journal): void {
    console.log('Eliminar diario:', journal);
  }

  onRefresh(): void {
    console.log('Refrescar grilla');
    this.loadJournals();
  }

  onPrint(journal: Journal): void {
    const documentNumber = Number(journal.documentNumber || 0);

    const params = new URLSearchParams({
      reportName: 'JournalReport',
      companyId: String(this.companyId || journal.companyId || 0),
      voucherTypeId: String(journal.voucherTypeId || 0),
      journalFrom: String(documentNumber),
      journalTo: String(documentNumber),
      t: String(Date.now())
    });

    const url = `${environment.api.url}/api/ReportViewer/viewer?${params.toString()}`;
    window.open(url, '_blank');
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
