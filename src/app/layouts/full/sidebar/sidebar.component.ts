import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  ngAfterViewInit() {}

  // Lista de items del menú
  menuItems = [
    {
      label: 'Inicio',
      route: '/dashboard',
      icon: 'bi bi-house-door',
      isExpanded: false,
    },
    {
      label: 'Usuarios',
      route: '/dashboard/docentes',
      icon: 'bi bi-person',
      isExpanded: false,
    },
    {
      label: 'Estudiantes',
      route: '/dashboard/estudiantes',
      icon: 'bi bi-people',
      isExpanded: false,
    },
    {
      label: 'Inscripciones',
      route: '/dashboard/inscripcion',
      icon: 'bi bi-clipboard-plus',
      isExpanded: false,
    },
    {
      label: 'Cursos',
      route: '/dashboard/curso',
      icon: 'bi bi-columns-gap',
      isExpanded: false,
    },
    {
      label: 'Materias',
      route: '/dashboard/materias',
      icon: 'bi bi-book',
      isExpanded: false,
    },
    {
      label: 'Gestiones',
      route: '/dashboard/gestion',
      icon: 'bi bi-book',
      isExpanded: false,
    },
    {
      label: 'Evaluaciones',
      icon: 'bi bi-calendar-event',
      children: [
        {
          label: 'Tipo de evaluacion',
          route: '/dashboard/tipo-evaluacion',
          icon: 'bi bi-cart',
        },
        {
          label: 'Evalucion integral',
          route: '/dashboard/evaluacion-integral',
          icon: 'bi bi-ticket-perforated',
        },
        // {
        //   label: 'Direcciones',
        //   route: '/dashboard/direcciones',
        //   icon: 'bi bi-geo-alt',
        // },
        /*{
          label: 'Evaluaciones',
          route: '/dashboard/evaluaciones',
          icon: 'bi bi-star',
        }*/
      ],
    },
    /*
    {
      label: 'Pagos',
      icon: 'bi bi-credit-card',
      children: [
        {
          label: 'Pagos',
          route: '/dashboard/pagos',
          icon: 'bi bi-credit-card',
        },
        {
          label: 'Metodos de pago',
          route: '/dashboard/metodos-pago',
          icon: 'bi bi-credit-card-2-back',
        },
      ]
    },
    {
      label: 'Reportes',
      icon: 'bi bi-file-earmark-bar-graph',
      children: [
        {
          label: 'Ventas por fecha',
          route: '/dashboard/reportes/ventas-por-fecha',
          icon: 'bi bi-file-earmark-bar-graph',
        },
        {
          label: 'Promedio de calificaciones',
          route: '/dashboard/reportes/promedio-calificaciones',
          icon: 'bi bi-file-earmark-bar-graph',
        },
        {
          label: 'Productos más vendidos',
          route: '/dashboard/reportes/productos-mas-vendidos',
          icon: 'bi bi-file-earmark-bar-graph',
        },
        {
          label: 'Ingresos por fecha',
          route: '/dashboard/reportes/ingresos-por-fecha',
          icon: 'bi bi-file-earmark-bar-graph',
        },
        {
          label: 'Pagos por metodo',
          route: '/dashboard/reportes/pagos-por-metodo',
          icon: 'bi bi-file-earmark-bar-graph',
        },
        {
          label: 'Productos con bajo stock',
          route: '/dashboard/reportes/productos-bajo-stock',
          icon: 'bi bi-file-earmark-bar-graph',
        }
      ]
    },*/
  ];

  toggleCollapse(selectedItem: any) {
    this.menuItems.forEach(item => {
      if (item !== selectedItem) {
        item.isExpanded = false; // Cierra los otros submenús
      }
    });
  
    // Alternar el submenú actual
    selectedItem.isExpanded = !selectedItem.isExpanded;
  }
}
