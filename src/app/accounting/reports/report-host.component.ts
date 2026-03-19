import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report-host',
  standalone: true,
  imports: [CommonModule, FormsModule, TextBoxModule, ButtonModule],
  templateUrl: './report-host.component.html',
  styleUrls: ['./report-host.component.scss']
})
export class ReportHostComponent {
  reportTitle = '';
  rdlFile = '';
  reportType = '';
  journalId = 1;
  companyId = 1;
  voucherTypeId = 0;
  journalFrom = 0;
  journalTo = 0;

  constructor(private route: ActivatedRoute) {
    const data = this.route.snapshot.data || {};
    this.reportTitle = data['reportTitle'] || 'Reporte';
    this.rdlFile = data['rdlFile'] || '';
    this.reportType = data['reportType'] || '';

    const queryParams = this.route.snapshot.queryParams || {};
    this.journalId = Number(queryParams['journalId'] || this.journalId);
    this.companyId = Number(queryParams['companyId'] || this.companyId);
    this.voucherTypeId = Number(queryParams['voucherTypeId'] || this.voucherTypeId);
    this.journalFrom = Number(queryParams['journalFrom'] || this.journalFrom || this.journalId);
    this.journalTo = Number(queryParams['journalTo'] || this.journalTo || this.journalId);
  }

  openJournalReportRdl(): void {
    if (!this.journalId || this.journalId <= 0) {
      return;
    }

    const params = new URLSearchParams({
      reportName: 'JournalReport',
      companyId: String(this.companyId || 1),
      voucherTypeId: String(this.voucherTypeId || 0),
      journalFrom: String(this.journalFrom || this.journalId),
      journalTo: String(this.journalTo || this.journalId)
    });

    const url = `${environment.api.url}/api/ReportViewer/viewer?${params.toString()}`;
    window.open(url, '_blank');
  }
}
