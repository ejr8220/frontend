import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { Journal, JournalService } from '../../../service/journal.service';
import { environment } from '../../../../../environments/environment';
import { SearchInputComponent, SearchInputConfig } from '../../../../shared/search-input/search-input.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-journal-crud-head',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBoxModule,
    DropDownListModule,
    DatePickerModule,
    ButtonModule,
    TooltipModule,
    SearchInputComponent
  ],
  templateUrl: './journal-crud-head.component.html',
  styleUrls: ['./journal-crud-head.component.scss']
})
export class JournalCrudHeadComponent implements OnInit, OnChanges {
  @ViewChild('cloneSearchInput') cloneSearchInput?: SearchInputComponent;

  @Input() journalData!: Journal;
  @Input() isEditMode = false;
  @Output() headDataChange = new EventEmitter<any>();
  @Output() cloneJournal = new EventEmitter<number>();

  headForm!: FormGroup;
  isLoadingNumber = false;
  private isPatchingForm = false;

  voucherTypes: any[] = [];
  books: any[] = [];

  cloneSearchColumns = [
    { field: 'id', headerText: 'ID', width: 80 },
    { field: 'documentNumber', headerText: 'N° Documento', width: 130 },
    { field: 'voucherName', headerText: 'Comprobante', width: 180 },
    { field: 'description', headerText: 'Descripción', width: 260 },
    { field: 'createdAtUtc', headerText: 'Fecha', width: 140 },
    { field: 'total', headerText: 'Total', width: 120 }
  ];

  get cloneSearchConfig(): SearchInputConfig {
    return {
      columns: this.cloneSearchColumns,
      method: `${environment.api.url}/api/accounting/Journal/GetAllFilter`,
      params: {
        companyId: this.journalData?.companyId || 0
      },
      requestType: 'POST',
      body: {
        value: {
          skip: 0,
          take: 200,
          requiresCounts: true
        }
      },
      title: 'Diarios disponibles'
    };
  }

  constructor(private fb: FormBuilder, private journalService: JournalService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();

    if (this.journalData) {
      this.loadFormData();
    }

    this.headForm.get('voucherTypeId')?.valueChanges.subscribe((voucherTypeId) => {
      if (this.isPatchingForm) {
        return;
      }
      this.loadLastNumber(voucherTypeId);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['journalData'] && this.headForm && this.journalData) {
      this.loadFormData();
    }
  }

  initializeForm(): void {
    this.headForm = this.fb.group({
      branchId: [null],
      voucherTypeId: [null, Validators.required],
      documentNumber: [{ value: null, disabled: true }],
      createdAtUtc: [new Date(), Validators.required],
      bookId: [null, Validators.required],
      description: ['', Validators.required]
    });

    // Emitir cambios cuando el formulario cambie
    this.headForm.valueChanges.subscribe(() => {
      this.emitForm();
    });
  }

  private loadCatalogs(): void {
    this.journalService.getVoucherTypes().subscribe({
      next: (items) => {
        this.voucherTypes = (items || []).map(v => ({ id: v.id, name: v.voucherName }));
      },
      error: (error) => console.error('Error al cargar tipos de comprobante:', error)
    });

    this.journalService.getBooks().subscribe({
      next: (items) => {
        this.books = (items || []).map(b => ({ id: b.id, name: b.description }));
      },
      error: (error) => console.error('Error al cargar libros:', error)
    });
  }

  private loadLastNumber(voucherTypeId: number): void {
    const companyId = this.journalData?.companyId || 1;
    if (!voucherTypeId || !companyId) {
      this.headForm.get('documentNumber')?.setValue(null, { emitEvent: false });
      this.emitForm();
      return;
    }

    this.isLoadingNumber = true;
    this.journalService.getLastDocumentNumber(companyId, voucherTypeId).subscribe({
      next: (response) => {
        const lastNumber = Number(response?.number ?? 0);
        const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
        this.headForm.get('documentNumber')?.setValue(nextNumber, { emitEvent: false });
        this.isLoadingNumber = false;
        this.emitForm();
      },
      error: (error) => {
        console.error('Error al obtener último número de diario:', error);
        this.headForm.get('documentNumber')?.setValue(1, { emitEvent: false });
        this.isLoadingNumber = false;
        this.emitForm();
      }
    });
  }

  loadFormData(): void {
    this.isPatchingForm = true;
    this.headForm.patchValue({
      branchId: this.journalData.branchId,
      voucherTypeId: this.journalData.voucherTypeId,
      bookId: this.journalData.bookId,
      documentNumber: this.journalData.documentNumber,
      description: this.journalData.description,
      createdAtUtc: this.journalData.createdAtUtc ? new Date(this.journalData.createdAtUtc) : new Date()
    }, { emitEvent: false });
    this.isPatchingForm = false;
  }

  onFieldChange(): void {
    this.emitForm();
  }

  openCloneSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isEditMode) {
      return;
    }

    this.cloneSearchInput?.openSearch(event);
  }

  onCloneSearchSelect(selectedRecord: any): void {
    const selectedId = Number(selectedRecord?.id || 0);
    if (selectedId > 0) {
      this.cloneJournal.emit(selectedId);
    }
  }

  private emitForm(): void {
    if (this.headForm.valid) {
      this.headDataChange.emit(this.headForm.getRawValue());
    }
  }
}
