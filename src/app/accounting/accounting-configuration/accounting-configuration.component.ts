import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { SearchInputComponent, SearchInputConfig } from '../../shared/search-input/search-input.component';
import { CompanySessionService } from '../../shared/company-session.service';
import { AccountingConfigurationService } from '../service/accounting-configuration.service';
import { environment } from '../../../environments/environment';

interface AccountConfigField {
  key: string;
  label: string;
  selectedAccount: any;
}

interface AccountFieldGroup {
  title: string;
  fields: AccountConfigField[];
}

@Component({
  selector: 'app-accounting-configuration',
  standalone: true,
  imports: [CommonModule, ButtonModule, SearchInputComponent],
  templateUrl: './accounting-configuration.component.html',
  styleUrls: ['./accounting-configuration.component.scss']
})
export class AccountingConfigurationComponent implements OnInit {
  companyId = 0;
  configuration: any = {};
  fieldGroups: AccountFieldGroup[] = [];
  isLoading = false;
  isSaving = false;

  accountSearchConfig!: SearchInputConfig;

  constructor(
    private companySessionService: CompanySessionService,
    private accountingConfigurationService: AccountingConfigurationService
  ) {}

  ngOnInit(): void {
    const company = this.companySessionService.getCurrentCompany();
    this.companyId = company?.id || 0;
    this.initializeSearchConfig();

    if (this.companyId > 0) {
      this.loadConfiguration();
    }
  }

  private initializeSearchConfig(): void {
    this.accountSearchConfig = {
      columns: [
        { field: 'code', headerText: 'Código', width: 120 },
        { field: 'description', headerText: 'Nombre', width: 260 }
      ],
      method: `${environment.api.url}/api/accounting/ChartAccount`,
      params: {
        companyId: this.companyId,
        detailOnly: true
      },
      title: 'Seleccione la cuenta contable'
    };
  }

  loadConfiguration(): void {
    this.isLoading = true;
    this.accountingConfigurationService.getByCompany(this.companyId).subscribe({
      next: (response) => {
        this.configuration = response || {};

        if (!this.configuration.companyId) {
          this.configuration.companyId = this.companyId;
        }

        this.fieldGroups = this.extractAccountFieldGroups(this.configuration);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar configuración contable:', error);
        // Inicializar configuración vacía pero mostrar todos los campos
        this.configuration = { companyId: this.companyId };
        this.fieldGroups = this.extractAccountFieldGroups(this.configuration);
        this.isLoading = false;
      }
    });
  }

  save(): void {
    if (this.companyId <= 0 || this.isSaving) {
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.configuration,
      companyId: this.companyId
    };

    this.accountingConfigurationService.save(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.loadConfiguration();
        alert('Configuración contable guardada correctamente.');
      },
      error: (error) => {
        console.error('Error al guardar configuración contable:', error);
        this.isSaving = false;
      }
    });
  }

  onAccountSelected(field: AccountConfigField, account: any): void {
    field.selectedAccount = account;
    this.configuration[field.key] = account?.id ?? null;
  }

  onAccountCleared(field: AccountConfigField): void {
    field.selectedAccount = null;
    this.configuration[field.key] = null;
  }

  trackByField(_: number, field: AccountConfigField): string {
    return field.key;
  }

  private extractAccountFieldGroups(configuration: any): AccountFieldGroup[] {
    const groups: AccountFieldGroup[] = [
      {
        title: 'Cuentas de Resultado',
        fields: [
          this.createField(configuration, 'profitAccountId', 'Cuenta de Ganancia'),
          this.createField(configuration, 'lossAccountId', 'Cuenta de Pérdida')
        ]
      },
      {
        title: 'Cuentas de Ventas',
        fields: [
          this.createField(configuration, 'salesInvoiceAccountId', 'Facturas por Cobrar'),
          this.createField(configuration, 'salesTicketAccountId', 'Boletas por Cobrar'),
          this.createField(configuration, 'salesVatAccountId', 'IVA Débito Fiscal'),
          this.createField(configuration, 'salesOtherTaxesAccountId', 'Otros Impuestos Ventas')
        ]
      },
      {
        title: 'Cuentas de Compras',
        fields: [
          this.createField(configuration, 'purchaseInvoiceAccountId', 'Facturas por Pagar'),
          this.createField(configuration, 'purchaseTicketAccountId', 'Boletas por Pagar'),
          this.createField(configuration, 'purchaseVatAccountId', 'IVA Crédito Fiscal'),
          this.createField(configuration, 'purchaseOtherTaxesAccountId', 'Otros Impuestos Compras'),
          this.createField(configuration, 'purchaseDefaultExpenseAccountId', 'Cuenta de Gasto por Defecto')
        ]
      },
      {
        title: 'Honorarios Pagados',
        fields: [
          this.createField(configuration, 'feePayableAccountId', 'Honorarios por Pagar'),
          this.createField(configuration, 'feeRetentionAccountId', 'Retención 2da Categoría')
        ]
      },
      {
        title: 'Honorarios Recibidos',
        fields: [
          this.createField(configuration, 'feeReceivableAccountId', 'Honorarios por Cobrar'),
          this.createField(configuration, 'feeRevenueRetentionPayableAccountId', 'Retención por Pagar'),
          this.createField(configuration, 'feeRevenueRetentionReceivableAccountId', 'Retención por Cobrar')
        ]
      }
    ];

    return groups;
  }

  private createField(configuration: any, key: string, label: string): AccountConfigField {
    const accountId = configuration?.[key];
    const selectedAccount = this.resolveSelectedAccount(configuration, key, accountId);
    return { key, label, selectedAccount };
  }

  private resolveSelectedAccount(configuration: any, key: string, accountId: any): any {
    if (!accountId || typeof accountId !== 'number' || accountId <= 0) {
      return null;
    }

    const baseKey = key.endsWith('Id') ? key.substring(0, key.length - 2) : key;
    const candidates = [
      configuration[baseKey],
      configuration[`${baseKey}Fk`],
      configuration[`${baseKey}Ref`]
    ];

    const fromCandidate = candidates.find(candidate => candidate && typeof candidate === 'object');
    if (fromCandidate) {
      return {
        id: fromCandidate.id ?? accountId,
        code: fromCandidate.code ?? fromCandidate.accountCode ?? '',
        description: fromCandidate.description ?? fromCandidate.name ?? fromCandidate.accountName ?? ''
      };
    }

    return {
      id: accountId,
      code: '',
      description: ''
    };
  }
}
