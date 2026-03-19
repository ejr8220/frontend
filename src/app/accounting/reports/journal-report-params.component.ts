import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { JournalService } from '../service/journal.service';
import { CompanySessionService } from '../../shared/company-session.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-journal-report-params',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule,
    ButtonModule
  ],
  templateUrl: './journal-report-params.component.html',
  styleUrls: ['./journal-report-params.component.scss']
})
export class JournalReportParamsComponent implements OnInit {
  companyId = 0;
  voucherTypeId = 0;
  journalFrom = 1;
  journalTo = 1;
  voucherTypes: Array<{ id: number; name: string }> = [];

  constructor(
    private journalService: JournalService,
    private companySessionService: CompanySessionService
  ) {}

  ngOnInit(): void {
    const currentCompany = this.companySessionService.getCurrentCompany();
    this.companyId = Number(currentCompany?.id || 0);

    this.journalService.getVoucherTypes().subscribe({
      next: (items) => {
        this.voucherTypes = (items || []).map(v => ({
          id: v.id,
          name: v.voucherName
        }));
      },
      error: (error) => console.error('Error al cargar tipos de comprobante:', error)
    });
  }

  openReport(): void {
    if (!this.companyId || this.companyId <= 0) {
      alert('Empresa inválida.');
      return;
    }

    if (!this.voucherTypeId || this.voucherTypeId <= 0) {
      alert('Seleccione un tipo de comprobante.');
      return;
    }

    if (!this.journalFrom || this.journalFrom <= 0 || !this.journalTo || this.journalTo <= 0) {
      alert('Diario Desde/Hasta debe ser mayor a cero.');
      return;
    }

    if (this.journalFrom > this.journalTo) {
      alert('Diario Desde no puede ser mayor que Diario Hasta.');
      return;
    }

    const params = new URLSearchParams({
      reportName: 'JournalReport',
      companyId: String(this.companyId),
      voucherTypeId: String(this.voucherTypeId),
      journalFrom: String(this.journalFrom),
      journalTo: String(this.journalTo),
      t: String(Date.now())
    });

    const url = `${environment.api.url}/api/ReportViewer/viewer?${params.toString()}`;
    window.open(url, '_blank');
  }
}
