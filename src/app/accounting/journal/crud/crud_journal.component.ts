import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { JournalService, Journal } from '../../service/journal.service';
import { JournalCrudHeadComponent } from './journal-crud-head/journal-crud-head.component';
import { JournalCrudDetailsComponent } from './journal-crud-details/journal-crud-details.component';
import { CompanySessionService } from '../../../shared/company-session.service';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crud-journal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    JournalCrudHeadComponent,
    JournalCrudDetailsComponent
  ],
  templateUrl: './crud_journal.component.html',
  styleUrls: ['./crud_journal.component.scss']
})
export class CrudJournalComponent implements OnInit {
  isEditMode = false;
  journalId: number | null = null;
  isLoading = false;
  
  journalData: Journal = {
    lines: [],
    branchId: null,
    companyId: 1,
    voucherTypeId: 0,
    documentId: null,
    description: '',
    bookId: 0,
    originalJournalId: null
  };

  constructor(
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute,
    private companySessionService: CompanySessionService
  ) {}

  ngOnInit(): void {
    const currentCompany = this.companySessionService.getCurrentCompany();
    if (currentCompany?.id) {
      this.journalData.companyId = currentCompany.id;
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.journalId = +params['id'];
        this.isEditMode = true;
        this.loadJournal(this.journalId);
      }
    });
  }

  loadJournal(id: number): void {
    this.isLoading = true;
    this.journalService.getJournalById(id).subscribe({
      next: (data) => {
        this.journalData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el diario:', error);
        this.isLoading = false;
      }
    });
  }

  onHeadDataChange(headData: any): void {
    // Actualizar los datos de la cabecera
    this.journalData = {
      ...this.journalData,
      ...headData
    };
  }

  onDetailsChange(lines: any[]): void {
    // Actualizar las líneas de detalle
    this.journalData.lines = lines;
    // Calcular el total
    this.calculateTotal();
  }

  calculateTotal(): void {
    const totalDebit = this.journalData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = this.journalData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    this.journalData.total = Math.max(totalDebit, totalCredit);
  }

  onSave(): void {
    const payload = this.buildPayloadForSave();
    const validationError = this.validateBeforeSave(payload);
    if (validationError) {
      alert(validationError);
      return;
    }

    this.isLoading = true;
    
    if (this.isEditMode && this.journalId) {
      this.journalService.updateJournal(this.journalId, payload).subscribe({
        next: (response) => {
          console.log('Diario actualizado exitosamente', response);
          this.isLoading = false;
          this.router.navigate(['/accounting/journal'], {
            state: { toastMessage: 'Diario actualizado correctamente.' }
          });
        },
        error: (error) => {
          console.error('Error al actualizar el diario:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.journalService.createJournal(payload).subscribe({
        next: (response) => {
          console.log('Diario creado exitosamente', response);
          this.isLoading = false;
          this.router.navigate(['/accounting/journal'], {
            state: { toastMessage: 'Diario guardado correctamente.' }
          });
        },
        error: (error) => {
          console.error('Error al crear el diario:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/accounting/journal']);
  }

  onCloneJournalSelected(sourceJournalId: number): void {
    if (!sourceJournalId || sourceJournalId <= 0) {
      return;
    }

    this.isLoading = true;
    this.journalService.getJournalById(sourceJournalId).subscribe({
      next: (sourceJournal) => {
        const companyId = Number(sourceJournal.companyId || this.journalData.companyId || 0);
        const voucherTypeId = Number(sourceJournal.voucherTypeId || 0);

        if (companyId <= 0 || voucherTypeId <= 0) {
          console.error('No se pudo obtener el secuencial: companyId o voucherTypeId inválido.');
          this.isLoading = false;
          return;
        }

        this.journalService.getLastDocumentNumber(companyId, voucherTypeId).subscribe({
          next: (numberResponse) => {
            const lastNumber = Number(numberResponse?.number ?? 0);
            const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

            const clonedLines = (sourceJournal.lines || []).map(line => ({
              ...line,
              id: undefined,
              journalId: undefined
            }));

            this.isEditMode = false;
            this.journalId = null;

            this.journalData = {
              ...sourceJournal,
              id: undefined,
              documentId: sourceJournal.documentId ?? null,
              originalJournalId: sourceJournal.id ?? null,
              createdAtUtc: new Date().toISOString(),
              documentNumber: nextNumber,
              lines: clonedLines
            };

            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al obtener secuencial para diario clonado:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al clonar diario:', error);
        this.isLoading = false;
      }
    });
  }

  onPrint(): void {
    if (!this.isEditMode || !this.journalId) {
      return;
    }

    const documentNumber = Number(this.journalData.documentNumber || 0);

    const params = new URLSearchParams({
      reportName: 'JournalReport',
      companyId: String(this.journalData.companyId || 0),
      voucherTypeId: String(this.journalData.voucherTypeId || 0),
      journalFrom: String(documentNumber),
      journalTo: String(documentNumber),
      t: String(Date.now())
    });

    const url = `${environment.api.url}/api/ReportViewer/viewer?${params.toString()}`;
    window.open(url, '_blank');
  }


  private buildPayloadForSave(): Journal {
    const normalizedLines = (this.journalData.lines || [])
      .filter(line => line.accountId > 0)
      .map(line => {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const auxiliaryId = Number(line.auxiliaryId);
        const costCenterId = Number(line.costCenterId);
        const auxiliaryTypeId = Number(line.auxiliaryTypeId);

        return {
          id: line.id,
          journalId: line.journalId,
          accountId: Number(line.accountId),
          auxiliaryId: Number.isFinite(auxiliaryId) && auxiliaryId > 0 ? auxiliaryId : null,
          costCenterId: Number.isFinite(costCenterId) && costCenterId > 0 ? costCenterId : null,
          debit: Number.isFinite(debit) ? debit : 0,
          credit: Number.isFinite(credit) ? credit : 0,
          detail: (line.detail || '').trim(),
          createdAtUtc: line.createdAtUtc,
          auxiliaryTypeId: Number.isFinite(auxiliaryTypeId) && auxiliaryTypeId > 0 ? auxiliaryTypeId : null,
          type: line.type,
          rut: line.rut,
          name: line.name,
          documentType: line.documentType,
          documentDate: line.documentDate,
          documentNumber: line.documentNumber,
          isPosted: line.isPosted
        };
      })
      .filter(line => (line.debit > 0 && line.credit === 0) || (line.credit > 0 && line.debit === 0));

    const totalDebit = normalizedLines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = normalizedLines.reduce((sum, line) => sum + line.credit, 0);
    const calculatedTotal = Math.max(totalDebit, totalCredit);

    return {
      ...this.journalData,
      branchId: this.journalData.branchId && this.journalData.branchId > 0
        ? Number(this.journalData.branchId)
        : null,
      companyId: Number(this.journalData.companyId || 0),
      voucherTypeId: Number(this.journalData.voucherTypeId || 0),
      bookId: Number(this.journalData.bookId || 0),
      documentNumber: Number(this.journalData.documentNumber || 0),
      description: (this.journalData.description || '').trim(),
      total: calculatedTotal,
      lines: normalizedLines
    };
  }

  private validateBeforeSave(payload: Journal): string | null {
    const missingHeaderFields: string[] = [];

    if (!payload.voucherTypeId || payload.voucherTypeId <= 0) {
      missingHeaderFields.push('Tipo de Comprobante');
    }

    if (!payload.bookId || payload.bookId <= 0) {
      missingHeaderFields.push('Libro');
    }

    if (!payload.companyId || payload.companyId <= 0) {
      missingHeaderFields.push('Empresa');
    }

    if (missingHeaderFields.length > 0) {
      return `Complete los campos de cabecera: ${missingHeaderFields.join(', ')}.`;
    }

    if (!payload.documentNumber || payload.documentNumber <= 0) {
      return 'El campo Número debe ser mayor a cero.';
    }

    if (!payload.description) {
      return 'La descripción del asiento es requerida.';
    }

    if (!payload.lines || payload.lines.length === 0) {
      return 'Debe registrar al menos una línea válida en el detalle.';
    }

    const debit = payload.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const credit = payload.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(debit - credit) > 0.01) {
      return 'El asiento no está balanceado. El total débito debe ser igual al total crédito.';
    }

    return null;
  }
}
