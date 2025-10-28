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
                route: '/general/master/parametros-generales'
              },
              {
                id: 'companies',
                name: 'Empresas',
                route: '/general/master/companies'
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
      }
    ],
    id: 'id',
    text: 'name',
    child: 'children'
  };

  onNodeSelected(event: any): void {
    const node = event.nodeData;
    if (node.route) {
      this.router.navigate([node.route]);
    }
  }
}