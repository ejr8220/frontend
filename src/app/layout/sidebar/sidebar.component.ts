import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TreeViewComponent, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TreeViewModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  constructor(private router: Router) {}

  treeFields = {
    dataSource: [
      {
        id: 'general',
        name: 'General',
        expanded: true,
        children: [
          {
            id: 'maestros',
            name: 'Maestros',
            children: [
              {
                id: 'parametros',
                name: 'Parámetros Generales',
                route: '/general/master/parametros'
              },
              {
                id: 'companies',
                name: 'Empresas',
                route: '/general/company'
              },
              {
                id: 'branches',
                name: 'Sucursales',
                route: '/general/master/branches'
              }
            ]
          },
          {
            id: 'reportes',
            name: 'Reportes',
            children: [
              {
                id: 'company-list',
                name: 'Listado de Empresa',
                route: '/general/reports/company-list'
              },
              {
                id: 'branch-list',
                name: 'Listado de Sucursales',
                route: '/general/reports/branch-list'
              }
            ]
          }
        ]
      },
      {
        id: 'contabilidad',
        name: 'Contabilidad',
        expanded: false,
        children: [
          {
            id: 'maestros-contabilidad',
            name: 'Maestros',
            children: [
              {
                id: 'plan-cuentas',
                name: 'Plan de Cuentas',
                route: '/accounting/chart-account'
              },
              {
                id: 'centro-costos',
                name: 'Centro de Costos',
                route: '/accounting/cost-center'
              }
            ]
          }
        ]
      }
    ],
    id: 'id',
    text: 'name',
    child: 'children'
  };

  onNodeSelected(event: any): void {
    console.log('Node selected:', event);
    const nodeData = event.nodeData;
    
    // Buscar el nodo en el dataSource usando el id
    const node = this.findNodeById(this.treeFields.dataSource, nodeData.id);
    
    if (node && node.route) {
      console.log('Navegando a:', node.route);
      this.router.navigate([node.route]);
    }
  }

  private findNodeById(nodes: any[], id: string): any {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }
}