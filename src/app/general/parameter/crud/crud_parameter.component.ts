import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { GridModule, ToolbarService, PageService, CommandColumnService, EditService } from '@syncfusion/ej2-angular-grids';
import { ParameterService, ParameterHeader, ParameterDetail } from '../../service/parameter.service';

@Component({
  selector: 'app-crud-parameter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBoxModule,
    CheckBoxModule,
    GridModule
  ],
  providers: [ToolbarService, PageService, CommandColumnService, EditService],
  templateUrl: './crud_parameter.component.html',
  styleUrls: ['./crud_parameter.component.scss']
})
export class CrudParameterComponent implements OnInit {
  parameterForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  parameterId: number | null = null;
  details: ParameterDetail[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private parameterService: ParameterService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.details = [];
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.parameterId = parseInt(params['id']);
        this.isEditMode = true;
        this.loadParameter();
      }
    });
  }

  initForm(): void {
    this.parameterForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      isGlobal: [true]
    });
  }

  loadParameter(): void {
    if (!this.parameterId) return;

    this.isLoading = true;
    this.parameterService.getById(this.parameterId).subscribe({
      next: (data) => {
        console.log('Parameter loaded:', data);
        this.parameterForm.patchValue({
          code: data.code,
          name: data.name,
          isGlobal: data.isGlobal
        });
        this.details = data.details && data.details.length > 0 ? [...data.details] : [];
        console.log('Details loaded:', this.details);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading parameter:', error);
        this.details = [];
        this.isLoading = false;
      }
    });
  }

  onDetailActionBegin(args: any): void {
    if (args.requestType === 'save') {
      const data = args.data;
      const index = this.details.findIndex(d => d.code === data.code);
      
      if (index !== -1) {
        this.details[index] = data;
      } else {
        data.id = 0;
        this.details.push(data);
      }
      this.details = [...this.details];
    } else if (args.requestType === 'delete') {
      const data = args.data[0];
      const index = this.details.findIndex(d => d.code === data.code);
      if (index !== -1) {
        this.details.splice(index, 1);
        this.details = [...this.details];
      }
    }
  }

  onDetailActionComplete(args: any): void {
    if (args.requestType === 'save' || args.requestType === 'delete') {
      this.details = [...this.details];
    }
  }

  onSubmit(): void {
    if (this.parameterForm.invalid) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    const data: ParameterHeader = {
      id: this.parameterId || 0,
      ...this.parameterForm.value,
      details: this.details,
      companyId: null,
      nameCompany: null
    };

    if (this.isEditMode && this.parameterId) {
      this.parameterService.update(this.parameterId, data).subscribe({
        next: () => {
          alert('Parámetro actualizado correctamente');
          this.router.navigate(['/general/master/parametros']);
        },
        error: (error) => console.error('Error updating:', error)
      });
    } else {
      this.parameterService.create(data).subscribe({
        next: () => {
          alert('Parámetro creado correctamente');
          this.router.navigate(['/general/master/parametros']);
        },
        error: (error) => console.error('Error creating:', error)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/general/master/parametros']);
  }
}
