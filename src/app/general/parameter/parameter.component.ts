import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GridModule, ToolbarService, PageService, EditService, SortService, FilterService, SelectionService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { ParameterService, ParameterHeader } from '../service/parameter.service';

@Component({
  selector: 'app-parameter',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule],
  providers: [ToolbarService, PageService, EditService, SortService, FilterService, SelectionService],
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss']
})
export class ParameterComponent implements OnInit {
  @ViewChild('grid') grid!: GridComponent;

  parameters: ParameterHeader[] = [];
  isLoading = false;
  toolbar: any[] = [
    { text: 'Add', prefixIcon: 'e-icons e-plus', id: 'Add' },
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];

  constructor(
    private parameterService: ParameterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParameters();
  }

  loadParameters(): void {
    this.isLoading = true;
    this.parameterService.getAllFilter().subscribe({
      next: (response) => {
        this.parameters = response.result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading parameters:', error);
        this.isLoading = false;
      }
    });
  }

  onToolbarClick(args: any): void {
    if (args.item.id === 'Add') {
      this.addParameter();
    } else if (args.item.id === 'Refresh') {
      this.refresh();
    }
  }

  onActionBegin(args: any): void {
    if (args.requestType === 'save') {
      const data = args.data;
      if (data.id) {
        this.parameterService.update(data.id, data).subscribe({
          next: () => {
            this.loadParameters();
          },
          error: (error) => console.error('Error updating parameter:', error)
        });
      }
    }
  }

  onActionFailure(args: any): void {
    console.error('Action failure:', args);
  }

  addParameter(): void {
    this.router.navigate(['/general/master/parametros/crud']);
  }

  editParameter(rowData: ParameterHeader): void {
    this.router.navigate(['/general/master/parametros/crud', rowData.id]);
  }

  deleteParameter(rowData: ParameterHeader): void {
    if (confirm(`¿Desea eliminar el parámetro ${rowData.name}?`)) {
      this.parameterService.delete(rowData.id).subscribe({
        next: () => {
          this.loadParameters();
        },
        error: (error) => console.error('Error deleting parameter:', error)
      });
    }
  }

  refresh(): void {
    this.loadParameters();
  }
}
