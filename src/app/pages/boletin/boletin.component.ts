/*import { Component } from '@angular/core';
import { BoletinService } from './services/boletin.service';
import { BoletinResponse } from './interfaces/boletin.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './boletin.component.html',
  styleUrls: ['./boletin.component.css']
})
export class BoletinComponent {
  estudiante_ci: number = 0;
  nombre_estudiante: string = '';
  gestionSeleccionada: string = '';
  data!: BoletinResponse;
  gestionDisponible: string[] = [];
  boletinFiltrado: any[] = [];

  constructor(private boletinService: BoletinService) {}

  buscar(): void {
    if (!this.estudiante_ci) return;
    this.boletinService.obtenerBoletin(this.estudiante_ci).subscribe({
      next: (res) => {
        this.data = res;
        this.nombre_estudiante = `Estudiante ${res.estudiante_ci}`;
        this.gestionDisponible = Object.keys(res.boletin);
        this.gestionSeleccionada = this.gestionDisponible[0] ?? '';
        this.aplicarFiltro();
      },
      error: () => alert('No se pudo obtener el boletín.')
    });
  }

  aplicarFiltro(): void {
    if (this.gestionSeleccionada && this.data?.boletin) {
      this.boletinFiltrado = this.data.boletin[this.gestionSeleccionada] || [];
    }
  }

  descargarPDF(): void {
    this.boletinService.descargarBoletinPDF(this.estudiante_ci, this.nombre_estudiante, this.gestionSeleccionada).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url);
    });
  }

  descargarExcel(): void {
    this.boletinService.descargarBoletinExcel(this.estudiante_ci, this.nombre_estudiante, this.gestionSeleccionada).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url);
    });
  }
}
*/

import { Component } from '@angular/core';
import { BoletinService } from './services/boletin.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletin-completo',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './boletin.component.html',
  styleUrls: ['./boletin.component.css']
})
export class BoletinComponent {
  ci: number = 0;
  year: number = 2025;

  columnas: string[] = []; // Columnas generadas dinámicamente
  materias: any[] = [];    // Lista de materias + notas
  encabezados: string[] = ['Materia']; // Materia + columnas dinámicas
  resumen: any = null;

  cargando: boolean = false;

  constructor(
    private boletinService: BoletinService,
    private alerts: AlertsService
  ) {}

  buscar(): void {
    if (!this.ci) {
      this.alerts.toast('Debe ingresar un CI válido', 'warning');
      return;
    }

    this.cargando = true;

    this.boletinService.obtenerBoletinCompleto(this.ci, this.year).subscribe({
      next: (res) => {
        this.resumen = res.resumen_general;
        this.procesarTabla(res.materias);
        this.cargando = false;
      },
      error: () => {
        this.alerts.toast('Error al obtener el boletín completo', 'error');
        this.cargando = false;
      }
    });
  }

  procesarTabla(materias: any[]): void {
    const columnasSet = new Set<string>();
    const materiasProcesadas: any[] = [];

    materias.forEach(materia => {
      const fila: any = { Materia: materia.materia_nombre };

      materia.periodos.forEach((periodo: any) => {
        const claveFinal = `${periodo.anio} - ${periodo.periodo} (Final)`;
        const claveEstimada = `${periodo.anio} - ${periodo.periodo} (Estimada)`;

        fila[claveFinal] = periodo.nota_final.valor ?? '-';
        fila[claveEstimada] = periodo.nota_estimada.valor ?? '-';

        columnasSet.add(claveFinal);
        columnasSet.add(claveEstimada);
      });

      materiasProcesadas.push(fila);
    });

    this.columnas = Array.from(columnasSet).sort();
    this.encabezados = ['Materia', ...this.columnas];
    this.materias = materiasProcesadas;
  }
}