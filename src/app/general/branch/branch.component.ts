import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, FilterService, PageService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { BranchService } from '../service/branch.service';
import { CompanySessionService } from '../../shared/company-session.service';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, GridModule],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  providers: [FilterService, PageService, ToolbarService]
})
export class BranchComponent implements OnInit {
  dataSource: any[] = [];
  isLoading = false;
  currentCompanyName = '';
  currentCompanyId: number | null = null;

  toolbar: any[] = [
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];

  pageSettings = { pageSize: 10 };
  filterSettings = { type: 'Menu' as const };

  constructor(
    private branchService: BranchService,
    private companySessionService: CompanySessionService
  ) {}

  ngOnInit(): void {
    this.loadBranchesByCurrentCompany();
  }

  loadBranchesByCurrentCompany(): void {
    const currentCompany = this.companySessionService.getCurrentCompany();
    this.currentCompanyId = currentCompany?.id ?? null;
    this.currentCompanyName = currentCompany?.name ?? '';

    if (!this.currentCompanyId) {
      this.dataSource = [];
      return;
    }

    this.isLoading = true;
    this.branchService.getByCompany(this.currentCompanyId).subscribe({
      next: (branches) => {
        this.dataSource = branches || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar sucursales por empresa:', error);
        this.dataSource = [];
        this.isLoading = false;
      }
    });
  }

  toolbarClick(args: any): void {
    if (args?.item?.id === 'Refresh') {
      this.loadBranchesByCurrentCompany();
    }
  }

  companyAccessor(field: string, data: any): string {
    return data?.company?.tradeName || data?.company?.legalName || '';
  }

  countryAccessor(field: string, data: any): string {
    return data?.country?.name || '';
  }

  provinceAccessor(field: string, data: any): string {
    return data?.province?.name || '';
  }

  cityAccessor(field: string, data: any): string {
    return data?.city?.name || '';
  }
}
