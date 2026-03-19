import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { CompanySessionService } from '../../shared/company-session.service';
import { AccountingIntegrationService } from '../service/accounting-integration.service';

interface BookType {
  text: string;
  value: string;
}

interface MonthOption {
  text: string;
  value: number;
}

@Component({
  selector: 'app-accounting-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, DropDownListModule, ButtonModule],
  templateUrl: './accounting-integration.component.html',
  styleUrls: ['./accounting-integration.component.scss']
})
export class AccountingIntegrationComponent {
  bookTypeFields = { text: 'text', value: 'value' };
  periodFields = { text: 'text', value: 'value' };

  bookTypes: BookType[] = [
    { text: 'Libro de Ventas (VENTAS)', value: 'SALE' },
    { text: 'Libro de Compras (COMPRAS)', value: 'PURCHASE' }
  ];

  months: MonthOption[] = [
    { text: 'Enero', value: 1 },
    { text: 'Febrero', value: 2 },
    { text: 'Marzo', value: 3 },
    { text: 'Abril', value: 4 },
    { text: 'Mayo', value: 5 },
    { text: 'Junio', value: 6 },
    { text: 'Julio', value: 7 },
    { text: 'Agosto', value: 8 },
    { text: 'Septiembre', value: 9 },
    { text: 'Octubre', value: 10 },
    { text: 'Noviembre', value: 11 },
    { text: 'Diciembre', value: 12 }
  ];

  years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  selectedBookType = 'SALE';
  selectedMonth = 2;
  selectedYear = 2026;
  companyId = 0;
  isLoading = false;

  constructor(
    private companySessionService: CompanySessionService,
    private accountingIntegrationService: AccountingIntegrationService
  ) {
    const currentCompany = this.companySessionService.getCurrentCompany();
    this.companyId = currentCompany?.id || 0;

    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
  }

  onCancel(): void {
    const today = new Date();
    this.selectedBookType = 'SALE';
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
  }

  onIntegrate(): void {
    if (this.companyId <= 0) {
      alert('No hay empresa seleccionada en sesión.');
      return;
    }

    const payload = {
      companyId: this.companyId,
      year: this.selectedYear,
      month: this.selectedMonth
    };

    this.isLoading = true;

    const request$ = this.selectedBookType === 'PURCHASE'
      ? this.accountingIntegrationService.descargarCompras(payload)
      : this.accountingIntegrationService.descargarVentas(payload);

    request$.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = response?.mensaje || response?.Mensaje || 'Integración completada.';
        alert(message);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || error?.error?.Error || error?.error?.Details || 'Error al ejecutar la integración contable.';
        alert(message);
      }
    });
  }
}
