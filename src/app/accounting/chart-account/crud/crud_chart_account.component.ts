import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { ChartAccountService } from '../../service/chart-account.service';
import { ParameterService, ParameterDetail } from '../../../general/service/parameter.service';

@Component({
  selector: 'app-crud-chart-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBoxModule,
    CheckBoxModule,
    DropDownListModule,
    ButtonModule
  ],
  templateUrl: './crud_chart_account.component.html',
  styleUrls: ['./crud_chart_account.component.scss']
})
export class CrudChartAccountComponent implements OnInit {
  chartAccountForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  chartAccountId: number | null = null;
  parentId: number | null = null;
  companyId = 1;
  isFromParent = false;
  parentAccountDisplay: string = '';
  auxiliaryTypes: ParameterDetail[] = [];
  classifier1Types: ParameterDetail[] = [];
  classifier2Types: ParameterDetail[] = [];
  auxiliaryTypeFields = { text: 'value', value: 'id' };
  showAuxiliaryTypeDropdown = false;
  showClassifier1Dropdown = false;
  showClassifier2Dropdown = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private chartAccountService: ChartAccountService,
    private parameterService: ParameterService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.chartAccountId = params['id'];
        this.isEditMode = true;
        this.loadChartAccount();
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['parentId']) {
        this.parentId = params['parentId'];
        this.isFromParent = true;
        this.loadParentAndPrefill();
      }
    });
  }

  initForm(): void {
    this.chartAccountForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      parentId: [null],
      isDetailAccount: [false],
      isAuxRequired: [false],
      auxiliaryTypeId: [null],
      isCostCenterRequired: [false],
      isDocumentRequired: [false],
      isClassifier1Required: [false],
      classifier1TypeId: [null],
      isClassifier2Required: [false],
      classifier2TypeId: [null],
      isBankReconciliation: [false],
      isReferenceCurrencyEntry: [false],
      isExchangeRateAdjustment: [false],
      isActive: [true],
      debtorSign: [1]
    });
    this.loadParameters();
    this.setupCheckboxWatchers();
  }

  loadParameters(): void {
    // Cargar AUXILIARY_TYPE
    this.parameterService.getAllFilter({
      page: 1,
      pageSize: 100,
      filters: [{ field: 'code', operator: 'eq', value: 'AUXILIARY_TYPE' }],
      sorts: []
    }).subscribe({
      next: (response) => {
        if (response.result.length > 0) {
          this.auxiliaryTypes = response.result[0].details || [];
        }
      },
      error: (error) => console.error('Error loading auxiliary types:', error)
    });

    // Cargar CLASSIFIER1_TYPE (si existe)
    this.parameterService.getAllFilter({
      page: 1,
      pageSize: 100,
      filters: [{ field: 'code', operator: 'eq', value: 'CLASSIFIER1_TYPE' }],
      sorts: []
    }).subscribe({
      next: (response) => {
        if (response.result.length > 0) {
          this.classifier1Types = response.result[0].details || [];
        }
      },
      error: (error) => console.error('Error loading classifier1 types:', error)
    });

    // Cargar CLASSIFIER2_TYPE (si existe)
    this.parameterService.getAllFilter({
      page: 1,
      pageSize: 100,
      filters: [{ field: 'code', operator: 'eq', value: 'CLASSIFIER2_TYPE' }],
      sorts: []
    }).subscribe({
      next: (response) => {
        if (response.result.length > 0) {
          this.classifier2Types = response.result[0].details || [];
        }
      },
      error: (error) => console.error('Error loading classifier2 types:', error)
    });
  }

  setupCheckboxWatchers(): void {
    // Watcher para isAuxRequired (Análisis por ficha)
    this.chartAccountForm.get('isAuxRequired')?.valueChanges.subscribe(checked => {
      this.showAuxiliaryTypeDropdown = checked;
      if (!checked) {
        this.chartAccountForm.patchValue({ auxiliaryTypeId: null });
      }
    });

    // Watcher para isClassifier1Required
    this.chartAccountForm.get('isClassifier1Required')?.valueChanges.subscribe(checked => {
      this.showClassifier1Dropdown = checked;
      if (!checked) {
        this.chartAccountForm.patchValue({ classifier1TypeId: null });
      }
    });

    // Watcher para isClassifier2Required
    this.chartAccountForm.get('isClassifier2Required')?.valueChanges.subscribe(checked => {
      this.showClassifier2Dropdown = checked;
      if (!checked) {
        this.chartAccountForm.patchValue({ classifier2TypeId: null });
      }
    });
  }

  loadChartAccount(): void {
    if (!this.chartAccountId) return;

    this.isLoading = true;
    this.chartAccountService.getById(this.chartAccountId).subscribe({
      next: (data) => {
        this.chartAccountForm.patchValue(data);
        this.showAuxiliaryTypeDropdown = data.isAuxRequired;
        this.showClassifier1Dropdown = data.isClassifier1Required;
        this.showClassifier2Dropdown = data.isClassifier2Required;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chart account:', error);
        this.isLoading = false;
      }
    });
  }

  loadParentAndPrefill(): void {
    if (!this.parentId) return;

    this.isLoading = true;
    this.chartAccountService.getById(this.parentId).subscribe({
      next: (parentData) => {
        this.parentAccountDisplay = `${parentData.code} - ${parentData.description}`;
        // Generar código automáticamente
        this.generateNextCode(parentData).subscribe(nextCode => {
          this.chartAccountForm.patchValue({
            code: nextCode,
            parentId: parentData.id,
            isAuxRequired: parentData.isAuxRequired,
            auxiliaryTypeId: parentData.auxiliaryTypeId,
            isCostCenterRequired: parentData.isCostCenterRequired,
            isDocumentRequired: parentData.isDocumentRequired,
            isClassifier1Required: parentData.isClassifier1Required,
            classifier1TypeId: parentData.classifier1TypeId,
            isClassifier2Required: parentData.isClassifier2Required,
            classifier2TypeId: parentData.classifier2TypeId,
            isBankReconciliation: parentData.isBankReconciliation,
            isReferenceCurrencyEntry: parentData.isReferenceCurrencyEntry,
            isExchangeRateAdjustment: parentData.isExchangeRateAdjustment,
            isActive: parentData.isActive,
            debtorSign: parentData.debtorSign
          });
          this.showAuxiliaryTypeDropdown = parentData.isAuxRequired;
          this.showClassifier1Dropdown = parentData.isClassifier1Required;
          this.showClassifier2Dropdown = parentData.isClassifier2Required;
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error loading parent account:', error);
        this.isLoading = false;
      }
    });
  }

  generateNextCode(parentAccount: any): Observable<string> {
    return new Observable(observer => {
      this.chartAccountService.getAllFilter(this.companyId).subscribe({
        next: (response) => {
          const siblings = response.result.filter(ca => ca.parentId === parentAccount.id);
          let nextCode = parentAccount.code + '.1';
          
          if (siblings.length > 0) {
            // Encontrar el último código numérico
            const lastSibling = siblings[siblings.length - 1];
            const parts = lastSibling.code.split('.');
            const lastNumber = parseInt(parts[parts.length - 1]);
            parts[parts.length - 1] = (lastNumber + 1).toString();
            nextCode = parts.join('.');
          }
          
          observer.next(nextCode);
          observer.complete();
        },
        error: (error) => {
          console.error('Error generating code:', error);
          observer.next(parentAccount.code + '.1');
          observer.complete();
        }
      });
    });
  }

  onSubmit(): void {
    if (this.chartAccountForm.invalid) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    const formValue = this.chartAccountForm.value;
    const code = String(formValue.code || '').trim();
    const computedLevel = code ? code.split('.').filter((part: string) => part !== '').length : 0;

    const parentIdRaw = formValue.parentId;
    const parentId = parentIdRaw === null || parentIdRaw === '' || parentIdRaw === undefined
      ? null
      : Number(parentIdRaw);

    const data = {
      ...formValue,
      id: this.isEditMode ? Number(this.chartAccountId || 0) : 0,
      companyId: Number(this.companyId),
      code,
      debtorSign: Number(formValue.debtorSign || 1),
      level: computedLevel,
      parentId: Number.isFinite(parentId as number) && (parentId as number) > 0 ? parentId : null,
      auxiliaryTypeId: formValue.isAuxRequired ? formValue.auxiliaryTypeId : null,
      classifier1TypeId: formValue.isClassifier1Required ? formValue.classifier1TypeId : null,
      classifier2TypeId: formValue.isClassifier2Required ? formValue.classifier2TypeId : null
    };

    if (this.isEditMode && this.chartAccountId) {
      this.chartAccountService.update(this.chartAccountId, data).subscribe({
        next: () => {
          alert('Cuenta actualizada correctamente');
          this.router.navigate(['/accounting/chart-account']);
        },
        error: (error) => {
          console.error('Error updating:', error);
          const message = error?.error?.message || error?.error?.title || 'No se pudo actualizar la cuenta.';
          alert(message);
        }
      });
    } else {
      this.chartAccountService.create(data).subscribe({
        next: () => {
          alert('Cuenta creada correctamente');
          this.router.navigate(['/accounting/chart-account']);
        },
        error: (error) => {
          console.error('Error creating:', error);
          const message = error?.error?.message || error?.error?.title || 'No se pudo crear la cuenta.';
          alert(message);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/accounting/chart-account']);
  }
}
