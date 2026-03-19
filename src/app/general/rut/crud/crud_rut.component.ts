import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { RutService, Rut } from '../../service/rut.service';

@Component({
  selector: 'app-crud-rut',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextBoxModule, NumericTextBoxModule],
  templateUrl: 'crud_rut.component.html',
  styleUrls: ['crud_rut.component.scss']
})
export class CrudRutComponent implements OnInit {
  rutForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  rutId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rutService: RutService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.rutId = Number(params['id']);
        this.isEditMode = true;
        this.loadRut();
      }
    });
  }

  initForm(): void {
    this.rutForm = this.formBuilder.group({
      identification: ['', [Validators.required]],
      originalIdentification: [''],
      name: ['', [Validators.required]],
      balance: [0],
      isActive: [true]
    });
  }

  loadRut(): void {
    if (!this.rutId) {
      return;
    }

    this.isLoading = true;
    this.rutService.getById(this.rutId).subscribe({
      next: (data) => {
        this.rutForm.patchValue({
          identification: data.identification || '',
          originalIdentification: data.originalIdentification || '',
          name: data.name || '',
          balance: data.balance ?? 0,
          isActive: data.isActive ?? true
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar RUT:', error);
        this.isLoading = false;
        alert('No fue posible cargar el registro.');
      }
    });
  }

  onSubmit(): void {
    if (this.rutForm.invalid) {
      this.rutForm.markAllAsTouched();
      alert('Complete los campos requeridos.');
      return;
    }

    const formValue = this.rutForm.value;
    const payload: Rut = {
      id: this.rutId || 0,
      identification: String(formValue.identification || '').trim(),
      originalIdentification: String(formValue.originalIdentification || '').trim(),
      name: String(formValue.name || '').trim(),
      balance: Number(formValue.balance ?? 0),
      isActive: !!formValue.isActive
    };

    if (this.isEditMode && this.rutId) {
      this.rutService.update(this.rutId, payload).subscribe({
        next: () => {
          alert('RUT actualizado correctamente.');
          this.router.navigate(['/general/transacciones/rut']);
        },
        error: (error) => {
          console.error('Error al actualizar RUT:', error);
          alert(error?.error?.message || 'No fue posible actualizar el RUT.');
        }
      });
      return;
    }

    this.rutService.create(payload).subscribe({
      next: () => {
        alert('RUT creado correctamente.');
        this.router.navigate(['/general/transacciones/rut']);
      },
      error: (error) => {
        console.error('Error al crear RUT:', error);
        alert(error?.error?.message || 'No fue posible crear el RUT.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/general/transacciones/rut']);
  }
}
