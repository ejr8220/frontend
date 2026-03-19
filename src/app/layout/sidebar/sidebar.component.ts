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
            id: 'transacciones-general',
            name: 'Transacciones',
            children: [
              {
                id: 'rut-transacciones',
                name: 'Rut',
                route: '/general/transacciones/rut'
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
              },
              {
                id: 'configuracion-contable',
                name: 'Configuración Contable',
                route: '/accounting/accounting-configuration'
              }
            ]
          },
          {
            id: 'transacciones',
            name: 'Transacciones',
            children: [
              {
                id: 'diarios-contables',
                name: 'Diarios Contables',
                route: '/accounting/journal'
              }
            ]
          },
          {
            id: 'procesos-contabilidad',
            name: 'Procesos',
            children: [
              {
                id: 'integracion-contable',
                name: 'Integración contable',
                route: '/accounting/accounting-integration'
              }
            ]
          },
          {
            id: 'reportes-contabilidad',
            name: 'Reportes',
            children: [
              {
                id: 'balance-general-8-columnas',
                name: 'Balance General de 8 Columnas',
                route: '/accounting/reports/balance-general-8-columnas'
              },
              {
                id: 'balance-comprobacion',
                name: 'Balance de Comprobación',
                route: '/accounting/reports/balance-comprobacion'
              },
              {
                id: 'asientos-diario-reporte',
                name: 'Asientos de Diario',
                route: '/accounting/reports/asientos-diario'
              },
              {
                id: 'libro-mayor',
                name: 'Libro Mayor',
                route: '/accounting/reports/libro-mayor'
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