import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GridModule, ToolbarService, PageService, EditService, SortService, FilterService, SelectionService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { ChartAccountService, ChartAccount } from '../service/chart-account.service';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-chart-account',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule],
  providers: [ToolbarService, PageService, EditService, SortService, FilterService, SelectionService],
  templateUrl: './chart-account.component.html',
  styleUrls: ['./chart-account.component.scss']
})
export class ChartAccountComponent implements OnInit {
  @ViewChild('grid') grid!: GridComponent;

  chartAccounts: ChartAccount[] = [];
  allChartAccounts: ChartAccount[] = [];
  expandedRows: Set<number> = new Set();
  isLoading = false;
  companyId = 1;
  toolbar: any[] = [
    { text: 'Add', prefixIcon: 'e-icons e-plus', id: 'Add' },
    { text: 'Refresh', prefixIcon: 'e-icons e-refresh', id: 'Refresh' }
  ];

  constructor(
    private chartAccountService: ChartAccountService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadChartAccounts();
  }

  loadChartAccounts(): void {
    this.isLoading = true;
    this.chartAccountService.getAllFilter(this.companyId).subscribe({
      next: (response) => {
        this.allChartAccounts = response.result;
        // Mostrar solo registros de nivel 1
        this.chartAccounts = response.result.filter(ca => ca.level === 1);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chart accounts:', error);
        this.isLoading = false;
      }
    });
  }

  toggleExpand(parentId: number): void {
    if (this.expandedRows.has(parentId)) {
      this.collapseRow(parentId);
    } else {
      this.expandRow(parentId);
    }
  }

  expandRow(parentId: number): void {
    this.expandedRows.add(parentId);
    const parentIndex = this.chartAccounts.findIndex(ca => ca.id === parentId);
    if (parentIndex !== -1) {
      const children = this.allChartAccounts.filter(ca => ca.parentId === parentId);
      // Insertar los hijos después del padre
      this.chartAccounts.splice(parentIndex + 1, 0, ...children);
      this.chartAccounts = [...this.chartAccounts]; // Trigger change detection
    }
  }

  collapseRow(parentId: number): void {
    this.expandedRows.delete(parentId);
    const parentIndex = this.chartAccounts.findIndex(ca => ca.id === parentId);
    if (parentIndex !== -1) {
      // Encontrar todos los hijos (directos e indirectos) a eliminar
      const toRemove = this.getChildrenToRemove(parentId);
      this.chartAccounts = this.chartAccounts.filter(ca => !toRemove.has(ca.id));
    }
  }

  private getChildrenToRemove(parentId: number): Set<number> {
    const toRemove = new Set<number>();
    const children = this.allChartAccounts.filter(ca => ca.parentId === parentId);
    
    children.forEach(child => {
      toRemove.add(child.id);
      this.expandedRows.delete(child.id);
      const grandchildren = this.getChildrenToRemove(child.id);
      grandchildren.forEach(gc => toRemove.add(gc));
    });
    
    return toRemove;
  }

  hasChildren(accountId: number): boolean {
    return this.allChartAccounts.some(ca => ca.parentId === accountId);
  }

  isExpanded(accountId: number): boolean {
    return this.expandedRows.has(accountId);
  }

  getIndentation(account: ChartAccount): string {
    return (account.level - 1) * 20 + 'px';
  }

  onToolbarClick(args: any): void {
    if (args.item.id === 'Add') {
      this.addChartAccount();
    } else if (args.item.id === 'Refresh') {
      this.refresh();
    }
  }

  addChildAccount(parentAccount: ChartAccount): void {
    this.addChartAccount(parentAccount);
  }

  onActionBegin(args: any): void {
    if (args.requestType === 'save') {
      const data = args.data;
      if (data.id) {
        this.chartAccountService.update(data.id, data).subscribe({
          next: () => {
            this.loadChartAccounts();
          },
          error: (error) => console.error('Error updating chart account:', error)
        });
      }
    }
  }

  onActionFailure(args: any): void {
    console.error('Action failure:', args);
  }

  addChartAccount(parentAccount?: ChartAccount): void {
    if (parentAccount) {
      this.router.navigate(['/accounting/chart-account/crud'], {
        queryParams: { parentId: parentAccount.id }
      });
    } else {
      this.router.navigate(['/accounting/chart-account/crud']);
    }
  }

  editChartAccount(rowData: ChartAccount): void {
    this.router.navigate(['/accounting/chart-account/crud', rowData.id]);
  }

  deleteChartAccount(rowData: ChartAccount): void {
    if (confirm(`¿Desea eliminar la cuenta ${rowData.code} - ${rowData.description}?`)) {
      this.chartAccountService.delete(rowData.id).subscribe({
        next: () => {
          this.loadChartAccounts();
        },
        error: (error) => console.error('Error deleting chart account:', error)
      });
    }
  }

  refresh(): void {
    this.loadChartAccounts();
  }
}

