import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { HttpClient } from '@angular/common/http';
import { SearchInputComponent, SearchInputConfig } from '../../../../shared/search-input/search-input.component';
import { CompanySessionService } from '../../../../shared/company-session.service';
import { Journal, JournalLine } from '../../../service/journal.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-journal-crud-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    NumericTextBoxModule,
    DropDownListModule,
    DatePickerModule,
    DialogModule,
    ButtonModule,
    SearchInputComponent
  ],
  templateUrl: './journal-crud-details.component.html',
  styleUrls: ['./journal-crud-details.component.scss']
})
export class JournalCrudDetailsComponent implements OnInit, OnChanges {
  @Input() journalData!: Journal;
  @Input() isEditMode = false;
  @Output() detailsChange = new EventEmitter<JournalLine[]>();
  
  lines: JournalLine[] = [];
  private lineSequence = 1;
  editableLineId: number | null = null;
  totalDebit = 0;
  totalCredit = 0;
  difference = 0;

  // Configuración de búsqueda de cuentas
  accountSearchConfig!: SearchInputConfig;
  rutSearchConfig!: SearchInputConfig;
  costCenterSearchConfig!: SearchInputConfig;

  analysisDialogVisible = false;
  analysisLineId: number | null = null;
  analysisAuxLabel = 'Ficha';
  analysisAuxSectionTitle = 'Análisis por ficha';
  private auxiliaryTypeLabelById = new Map<number, string>();
  private auxiliaryTypeCatalogLoaded = false;
  private loadingAuxiliaryTypeCatalog = false;

  analysisConfig = {
    isAuxRequired: false,
    isDocumentRequired: false,
    isCostCenterRequired: false
  };

  documentTypes: Array<{ id: number; documentName: string }> = [];
  documentTypeFields = { text: 'documentName', value: 'documentName' };

  constructor(
    private http: HttpClient,
    private companySessionService: CompanySessionService
  ) {
    this.initializeAccountSearchConfig();
    this.initializeRutSearchConfig();
    this.initializeCostCenterSearchConfig();
  }

  ngOnInit(): void {
    this.initializeAccountSearchConfig();
    this.initializeRutSearchConfig();
    this.initializeCostCenterSearchConfig();
    this.loadDocumentTypes();
    this.loadAuxiliaryTypeCatalog();

    if (this.journalData && this.journalData.lines) {
      this.lines = (this.journalData.lines || []).map(line => this.withClientId(line));
      this.calculateTotals();
    } else {
      this.lines = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['journalData']) {
      this.initializeAccountSearchConfig();
      this.initializeRutSearchConfig();
      this.initializeCostCenterSearchConfig();

      if (this.journalData && Array.isArray(this.journalData.lines)) {
        this.lines = this.journalData.lines.map(line => this.withClientId({ ...line }));
      } else {
        this.lines = [];
      }

      this.editableLineId = null;
      this.analysisDialogVisible = false;
      this.analysisLineId = null;
      this.calculateTotals();
    }
  }

  private withClientId(line: JournalLine): JournalLine {
    const current = line as any;
    if (!current._clientId) {
      current._clientId = this.lineSequence++;
    }
    if (current._saved === undefined) {
      current._saved = false;
    }
    return current;
  }

  private getLineId(line: JournalLine): number {
    return (line as any)._clientId;
  }

  private syncLineData(line: JournalLine, emitChanges: boolean): void {
    const lineId = this.getLineId(line);
    const target = this.lines.find(l => this.getLineId(l) === lineId);
    if (!target) {
      return;
    }

    Object.assign(target as any, line as any);
    this.calculateTotals();

    if (emitChanges) {
      this.detailsChange.emit(this.lines);
    }
  }

  isLineReadOnly(line: JournalLine): boolean {
    return this.editableLineId !== this.getLineId(line);
  }

  isLineEditable(line: JournalLine): boolean {
    return !this.isLineReadOnly(line);
  }

  initializeAccountSearchConfig(): void {
    const sessionCompanyId = this.companySessionService.getCurrentCompany()?.id;
    const companyId = sessionCompanyId && sessionCompanyId > 0
      ? sessionCompanyId
      : this.journalData?.companyId;
    const endpoint = `${environment.api.url}/api/accounting/ChartAccount/GetAllFilter`;
    const params: Record<string, any> = {
      detailOnly: true
    };

    if (companyId && companyId > 0) {
      params['companyId'] = companyId;
    }

    this.accountSearchConfig = {
      columns: [
        { field: 'code', headerText: 'Código', width: 120 },
        { field: 'description', headerText: 'Nombre', width: 250 }
      ],
      method: endpoint,
      requestType: 'POST',
      params,
      body: {
        value: {
          skip: 0,
          take: 20,
          requiresCounts: true
        }
      },
      title: 'Seleccione la cuenta contable'
    };
  }

  initializeRutSearchConfig(): void {
    this.rutSearchConfig = {
      columns: [
        { field: 'identification', headerText: 'RUT', width: 180 },
        { field: 'name', headerText: 'Razón social', width: 280 }
      ],
      method: `${environment.api.url}/api/general/Rut/GetAllFilter`,
      requestType: 'POST',
      params: {},
      body: {
        value: {
          skip: 0,
          take: 200,
          requiresCounts: true
        }
      },
      title: 'Seleccione la ficha'
    };
  }

  initializeCostCenterSearchConfig(): void {
    this.costCenterSearchConfig = {
      columns: [
        { field: 'id', headerText: 'ID', width: 100 },
        { field: 'module', headerText: 'Centro de costo', width: 260 }
      ],
      method: `${environment.api.url}/api/general/CostCenter/GetAllFilter`,
      requestType: 'POST',
      params: {},
      body: {
        value: {
          skip: 0,
          take: 200,
          requiresCounts: true
        }
      },
      title: 'Seleccione centro de costo'
    };
  }

  loadDocumentTypes(): void {
    this.http.get<Array<{ id: number; documentName: string }>>(`${environment.api.url}/api/general/DocumentType`).subscribe({
      next: (items) => {
        this.documentTypes = items || [];
      },
      error: (error) => {
        console.error('Error al cargar tipos de documento:', error);
        this.documentTypes = [];
      }
    });
  }

  formatAccountName(account: any): string {
    if (!account) return '';
    return `${account.code || ''} - ${account.description || ''}`;
  }

  calculateTotals(): void {
    this.totalDebit = this.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    this.totalCredit = this.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    this.difference = this.totalDebit - this.totalCredit;
  }

  addLine(): void {
    const newLine: JournalLine = this.withClientId({
      accountId: 0,
      auxiliaryId: null,
      costCenterId: null,
      debit: 0,
      credit: 0,
      detail: '',
      auxiliaryTypeId: null
    });

    this.lines = [...this.lines, newLine];
    this.editableLineId = this.getLineId(newLine);
    this.onLineChange();
  }

  trackByLine(index: number, line: JournalLine): number {
    const current = line as any;
    return current._clientId ?? current.id ?? index;
  }

  isBalanced(): boolean {
    return Math.abs(this.difference) < 0.01; // Considerar balanceado si la diferencia es menor a 1 centavo
  }

  onAccountSelect(account: any, line: JournalLine): void {
    if (!this.isLineEditable(line)) {
      return;
    }

    if (account) {
      const accountName = this.formatAccountName(account);
      line.accountId = account.id;
      line.account = {
        id: account.id,
        name: accountName,
        code: account.code,
        description: account.description
      };
      this.syncLineData(line, true);

      this.loadAnalysisConfigAndOpenModal(line, account.id, account);
    }
  }

  onAccountClear(line: JournalLine): void {
    if (!this.isLineEditable(line)) {
      return;
    }

    line.accountId = 0;
    line.account = undefined;
    (line as any)._analysisConfig = null;
    (line as any)._analysisAuxLabel = null;
    line.rut = undefined;
    line.name = undefined;
    line.auxiliaryId = null;
    line.documentType = undefined;
    line.documentNumber = undefined;
    line.documentDate = undefined;
    line.costCenterId = null;
    (line as any)._costCenterLabel = undefined;
    this.syncLineData(line, true);
  }

  private loadAnalysisConfigAndOpenModal(line: JournalLine, accountId: number, selectedAccount?: any): void {
    if (!accountId || accountId <= 0) {
      return;
    }

    const selectedConfig = {
      isAuxRequired: this.toBooleanFlag(selectedAccount?.isAuxRequired ?? selectedAccount?.IsAuxRequired),
      isDocumentRequired: this.toBooleanFlag(selectedAccount?.isDocumentRequired ?? selectedAccount?.IsDocumentRequired),
      isCostCenterRequired: this.toBooleanFlag(selectedAccount?.isCostCenterRequired ?? selectedAccount?.IsCostCenterRequired)
    };

    this.http.get<any>(`${environment.api.url}/api/accounting/ChartAccount/${accountId}`).subscribe({
      next: (accountConfig) => {
        const detailConfig = {
          isAuxRequired: this.toBooleanFlag(accountConfig?.isAuxRequired ?? accountConfig?.IsAuxRequired),
          isDocumentRequired: this.toBooleanFlag(accountConfig?.isDocumentRequired ?? accountConfig?.IsDocumentRequired),
          isCostCenterRequired: this.toBooleanFlag(accountConfig?.isCostCenterRequired ?? accountConfig?.IsCostCenterRequired)
        };

        const resolvedConfig = {
          isAuxRequired: selectedConfig.isAuxRequired || detailConfig.isAuxRequired,
          isDocumentRequired: selectedConfig.isDocumentRequired || detailConfig.isDocumentRequired,
          isCostCenterRequired: selectedConfig.isCostCenterRequired || detailConfig.isCostCenterRequired
        };

        this.ensureAuxiliaryTypeCatalog(() => {
          const auxiliaryText = this.resolveAuxiliaryText(accountConfig);

          (line as any)._analysisConfig = resolvedConfig;
          (line as any)._analysisAuxLabel = auxiliaryText.fieldLabel;
          (line as any)._analysisAuxSectionTitle = auxiliaryText.sectionTitle;

          if (resolvedConfig.isAuxRequired || resolvedConfig.isDocumentRequired || resolvedConfig.isCostCenterRequired) {
            this.openAnalysisModal(line);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar configuración de análisis de la cuenta:', error);
      }
    });
  }

  private resolveAuxiliaryText(accountConfig: any): { sectionTitle: string; fieldLabel: string } {
    const auxiliaryType = accountConfig?.auxiliaryType ?? accountConfig?.AuxiliaryType;
    const auxiliaryTypeId = Number(accountConfig?.auxiliaryTypeId ?? accountConfig?.AuxiliaryTypeId ?? 0);
    const fallbackById = auxiliaryTypeId > 0 ? this.auxiliaryTypeLabelById.get(auxiliaryTypeId) : '';
    const rawLabel = String(auxiliaryType?.value || auxiliaryType?.name || auxiliaryType?.description || auxiliaryType?.code || fallbackById || '').trim();

    if (!rawLabel) {
      return {
        sectionTitle: 'Análisis por ficha',
        fieldLabel: 'Ficha'
      };
    }

    const normalized = rawLabel
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/[^a-záéíóúñ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const humanized = rawLabel.replace(/[_-]+/g, ' ').trim();
    return {
      sectionTitle: `Análisis por ${humanized.toLowerCase()}`,
      fieldLabel: this.toSingular(humanized)
    };
  }

  private toSingular(label: string): string {
    const trimmed = String(label || '').trim();
    if (!trimmed) {
      return 'Ficha';
    }

    const lower = trimmed.toLowerCase();

    if (lower.endsWith('es') && trimmed.length > 3) {
      return trimmed.slice(0, -2);
    }

    if (lower.endsWith('s') && trimmed.length > 2) {
      return trimmed.slice(0, -1);
    }

    return trimmed;
  }

  private loadAuxiliaryTypeCatalog(): void {
    this.ensureAuxiliaryTypeCatalog();
  }

  private ensureAuxiliaryTypeCatalog(onReady?: () => void): void {
    if (this.auxiliaryTypeCatalogLoaded) {
      onReady?.();
      return;
    }

    if (this.loadingAuxiliaryTypeCatalog) {
      return;
    }

    this.loadingAuxiliaryTypeCatalog = true;

    this.http.get<any[]>(`${environment.api.url}/api/general/ParameterHeader`).subscribe({
      next: (headers) => {
        const auxiliaryHeader = (headers || []).find((item: any) => String(item?.code || '').toUpperCase() === 'AUXILIARY_TYPE');
        const headerId = Number(auxiliaryHeader?.id || 0);

        if (headerId <= 0) {
          this.auxiliaryTypeCatalogLoaded = true;
          this.loadingAuxiliaryTypeCatalog = false;
          onReady?.();
          return;
        }

        this.http.get<any>(`${environment.api.url}/api/general/ParameterHeader/${headerId}`).subscribe({
          next: (header) => {
            const details = header?.details || [];

            for (const detail of details) {
              const id = Number(detail?.id || 0);
              if (id <= 0) {
                continue;
              }

              const label = String(detail?.description || detail?.value || detail?.code || '').trim();
              if (label) {
                this.auxiliaryTypeLabelById.set(id, label);
              }
            }

            this.auxiliaryTypeCatalogLoaded = true;
            this.loadingAuxiliaryTypeCatalog = false;
            onReady?.();
          },
          error: () => {
            this.loadingAuxiliaryTypeCatalog = false;
            onReady?.();
          }
        });
      },
      error: () => {
        this.loadingAuxiliaryTypeCatalog = false;
        onReady?.();
      }
    });
  }

  openAnalysisModal(line: JournalLine): void {
    const lineId = this.getLineId(line);
    const config = (line as any)._analysisConfig || {
      isAuxRequired: false,
      isDocumentRequired: false,
      isCostCenterRequired: false
    };

    this.analysisLineId = lineId;
    this.analysisConfig = {
      isAuxRequired: !!config.isAuxRequired,
      isDocumentRequired: !!config.isDocumentRequired,
      isCostCenterRequired: !!config.isCostCenterRequired
    };
    this.analysisAuxLabel = (line as any)._analysisAuxLabel || 'Ficha';
    this.analysisAuxSectionTitle = (line as any)._analysisAuxSectionTitle || 'Análisis por ficha';
    this.analysisDialogVisible = true;
  }

  closeAnalysisModal(): void {
    this.analysisDialogVisible = false;
  }

  getAnalysisLine(): JournalLine | null {
    if (this.analysisLineId === null) {
      return null;
    }

    return this.lines.find(line => this.getLineId(line) === this.analysisLineId) || null;
  }

  onRutSelect(selected: any): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    const identification = String(selected?.identification ?? selected?.Identification ?? '').trim();
    const businessName = String(selected?.name ?? selected?.Name ?? '').trim();
    const selectedAuxiliaryId = Number(
      selected?.id ??
      selected?.Id ??
      selected?.rutId ??
      selected?.RutId ??
      0
    );

    line.auxiliaryId = selectedAuxiliaryId > 0
      ? selectedAuxiliaryId
      : (Number(line.auxiliaryId || 0) > 0 ? Number(line.auxiliaryId) : null);
    line.rut = identification || undefined;
    line.name = businessName || undefined;
    (line as any)._rutDisplay = {
      name: `${identification} - ${businessName}`.trim().replace(/^\s*-\s*|\s*-\s*$/g, '')
    };

    this.syncLineData(line, false);
  }

  onRutClear(): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    line.auxiliaryId = null;
    line.rut = undefined;
    line.name = undefined;
    (line as any)._rutDisplay = null;
    this.syncLineData(line, false);
  }

  onCostCenterSelect(selected: any): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    line.costCenterId = Number(selected?.id || 0) || null;
    (line as any)._costCenterLabel = String(selected?.module || '');
    this.syncLineData(line, false);
  }

  onCostCenterClear(): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    line.costCenterId = null;
    (line as any)._costCenterLabel = undefined;
    this.syncLineData(line, false);
  }

  onDocumentTypeChange(value: any): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    line.documentType = value ? String(value) : undefined;
    this.syncLineData(line, false);
  }

  onDocumentNumberChange(value: string): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    line.documentNumber = value ? String(value).trim() : undefined;
    this.syncLineData(line, false);
  }

  onDocumentDateChange(event: any): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    const selectedDate = event?.value as Date | null;
    line.documentDate = selectedDate ? selectedDate.toISOString() : undefined;
    this.syncLineData(line, false);
  }

  confirmAnalysis(): void {
    const line = this.getAnalysisLine();
    if (!line) {
      return;
    }

    const validationMessage = this.validateLineAnalysis(line);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    this.syncLineData(line, true);
    this.closeAnalysisModal();
  }

  private validateLineAnalysis(line: JournalLine): string | null {
    const config = (line as any)._analysisConfig;
    if (!config) {
      return null;
    }

    if (config.isAuxRequired) {
      const auxiliaryId = Number(line.auxiliaryId || 0);
      const hasRutText = !!String(line.rut || '').trim() && !!String(line.name || '').trim();
      const hasDisplayText = !!String((line as any)?._rutDisplay?.name || '').trim();
      if (auxiliaryId <= 0 && !hasRutText && !hasDisplayText) {
        return 'Debe completar Análisis por ficha (RUT y razón social).';
      }
    }

    if (config.isDocumentRequired) {
      if (!line.documentType || !line.documentNumber || !line.documentDate) {
        return 'Debe completar Análisis por documento (tipo, número y fecha).';
      }
    }

    if (config.isCostCenterRequired) {
      if (!line.costCenterId || line.costCenterId <= 0) {
        return 'Debe seleccionar un centro de costo.';
      }
    }

    return null;
  }

  private toBooleanFlag(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si';
    }

    return false;
  }

  updateLineField(line: JournalLine, field: keyof JournalLine, value: any): void {
    if (!this.isLineEditable(line)) {
      return;
    }

    if (field === 'debit' || field === 'credit') {
      const parsed = Number(value);
      (line as any)[field] = Number.isFinite(parsed) ? parsed : 0;
    } else {
      (line as any)[field] = value;
    }

    this.syncLineData(line, true);
  }

  updateDecimalFieldFromNumeric(line: JournalLine, field: 'debit' | 'credit', event: any): void {
    const value = Number(event?.value ?? line[field] ?? 0);
    this.updateLineField(line, field, Number.isFinite(value) ? value : 0);
  }

  onRowDoubleClick(event: MouseEvent, line: JournalLine): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }

    this.startEditLine(line);
  }

  startEditLine(line: JournalLine): void {
    this.editableLineId = this.getLineId(line);
    this.syncLineData(line, false);
  }

  saveLine(line: JournalLine): void {
    const lineId = this.getLineId(line);
    if (this.editableLineId !== lineId) {
      return;
    }

    const validationMessage = this.validateLineAnalysis(line);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    this.editableLineId = null;
    this.syncLineData(line, true);
  }

  getAccountDisplayValue(line: JournalLine): any {
    if (line.account) {
      const accountData: any = {
        id: line.account.id,
        code: line.account.code,
        description: line.account.description,
        name: line.account.name
      };

      if (!accountData.name && (accountData.code || accountData.description)) {
        accountData.name = this.formatAccountName(accountData);
      }

      return accountData;
    }
    return null;
  }

  getReadonlyAccountLabel(line: JournalLine): string {
    if (line.account?.name) {
      return line.account.name;
    }

    if (line.account?.code || line.account?.description) {
      return this.formatAccountName(line.account);
    }

    return '';
  }

  getRutDisplayValue(line: JournalLine): any {
    const display = (line as any)._rutDisplay;
    if (display?.name) {
      return display;
    }

    if (line.rut || line.name) {
      return {
        name: `${line.rut || ''} - ${line.name || ''}`.trim().replace(/^\s*-\s*|\s*-\s*$/g, '')
      };
    }

    return null;
  }

  getCostCenterDisplayValue(line: JournalLine): any {
    const label = (line as any)._costCenterLabel;
    if (label) {
      return { module: label };
    }
    return null;
  }

  getReadonlyAuxLabel(line: JournalLine): string {
    const combined = `${line.rut || ''} - ${line.name || ''}`.trim().replace(/^\s*-\s*|\s*-\s*$/g, '');
    return combined;
  }

  getReadonlyCostCenterLabel(line: JournalLine): string {
    return (line as any)._costCenterLabel || '';
  }

  getAnalysisDocumentDate(): Date | null {
    const line = this.getAnalysisLine();
    if (!line?.documentDate) {
      return null;
    }

    const parsed = new Date(line.documentDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  openAnalysisFromLine(line: JournalLine): void {
    if (!this.isLineEditable(line)) {
      return;
    }

    const accountId = Number(line.accountId || line.account?.id || 0);
    if (accountId <= 0) {
      return;
    }

    this.loadAnalysisConfigAndOpenModal(line, accountId, line.account);
  }

  onLineChange(): void {
    this.calculateTotals();
    this.detailsChange.emit(this.lines);
  }

  deleteLine(line: JournalLine): void {
    const lineId = this.getLineId(line);
    this.lines = this.lines.filter(l => this.getLineId(l) !== lineId);
    if (this.editableLineId === lineId) {
      this.editableLineId = null;
    }
    this.onLineChange();
  }
}
