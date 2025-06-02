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
*/

import { Component } from '@angular/core';
import { BoletinService } from './services/boletin.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  
  // Datos del estudiante
  estudiante: any = null;
  cursosEstudiante: any[] = [];

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
        this.estudiante = res.estudiante;
        this.cursosEstudiante = res.cursos;
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
  }  descargarPDF(): void {
    if (!this.estudiante) {
      this.alerts.toast('No hay datos para descargar', 'warning');
      return;
    }
    
    this.alerts.toast('Generando PDF...', 'info');
    
    try {
      const doc = new jsPDF();
      
      // Título del documento
      doc.setFontSize(18);
      doc.text('Boletín de Notas', 14, 22);
      
      // Información del estudiante
      doc.setFontSize(12);
      doc.text(`CI: ${this.estudiante.ci}`, 14, 35);
      doc.text(`Nombre: ${this.estudiante.nombreCompleto}`, 14, 45);
      doc.text(`Año: ${this.year}`, 14, 55);
      
      if (this.cursosEstudiante.length > 0) {
        const cursos = this.cursosEstudiante.map(c => 
          `${c.nombre}${c.paralelo ? ' - ' + c.paralelo : ''}`
        ).join(', ');
        doc.text(`Curso(s): ${cursos}`, 14, 65);
      }
      
      // Preparar datos para la tabla
      const tableColumns = this.encabezados;
      const tableRows = this.materias.map(materia => 
        this.encabezados.map(col => materia[col] ?? '-')
      );
      
      // Crear la tabla
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 80,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 40 } // Columna de materia más ancha
        }
      });
      
      // Agregar resumen si existe
      if (this.resumen) {
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.text(`Promedio General Final: ${this.resumen.promedio_general_final ?? 'N/A'}`, 14, finalY);
        doc.text(`Promedio General Estimado: ${this.resumen.promedio_general_estimado ?? 'N/A'}`, 14, finalY + 10);
      }
      
      // Descargar el archivo
      const fileName = `boletin_${this.estudiante.nombreCompleto.replace(/\s+/g, '_')}_${this.year}.pdf`;
      doc.save(fileName);
      
      this.alerts.toast('PDF generado exitosamente', 'success');
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.alerts.toast('Error al generar PDF', 'error');
    }
  }
  descargarExcel(): void {
    if (!this.estudiante) {
      this.alerts.toast('No hay datos para descargar', 'warning');
      return;
    }
    
    this.alerts.toast('Generando Excel...', 'info');
    
    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Crear hoja de información del estudiante
      const infoData = [
        ['BOLETÍN DE NOTAS'],
        [''],
        ['CI:', this.estudiante.ci],
        ['Nombre:', this.estudiante.nombreCompleto],
        ['Año:', this.year]
      ];
      
      if (this.estudiante.fechaNacimiento) {
        infoData.push(['Fecha de Nacimiento:', new Date(this.estudiante.fechaNacimiento).toLocaleDateString('es-ES')]);
      }
      
      if (this.estudiante.apoderado) {
        infoData.push(['Apoderado:', this.estudiante.apoderado]);
      }
      
      if (this.estudiante.telefono) {
        infoData.push(['Teléfono:', this.estudiante.telefono]);
      }
      
      if (this.cursosEstudiante.length > 0) {
        const cursos = this.cursosEstudiante.map(c => 
          `${c.nombre}${c.paralelo ? ' - ' + c.paralelo : ''}`
        ).join(', ');
        infoData.push(['Curso(s):', cursos]);
      }
      
      infoData.push([''], ['NOTAS POR MATERIA:']);
      
      // Crear datos de la tabla de notas
      const notasData = [this.encabezados];
      this.materias.forEach(materia => {
        const fila = this.encabezados.map(col => materia[col] ?? '-');
        notasData.push(fila);
      });
      
      // Agregar resumen si existe
      if (this.resumen) {
        notasData.push([]);
        notasData.push(['RESUMEN GENERAL:']);
        notasData.push(['Promedio General Final:', this.resumen.promedio_general_final ?? 'N/A']);
        notasData.push(['Promedio General Estimado:', this.resumen.promedio_general_estimado ?? 'N/A']);
      }
      
      // Combinar toda la información
      const allData = [...infoData, [], ...notasData];
      
      // Crear la hoja de trabajo
      const worksheet = XLSX.utils.aoa_to_sheet(allData);
      
      // Establecer anchos de columna
      const colWidths = [
        { wch: 25 }, // Primera columna más ancha
        ...this.encabezados.slice(1).map(() => ({ wch: 15 }))
      ];
      worksheet['!cols'] = colWidths;
      
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Boletín');
      
      // Generar el archivo
      const fileName = `boletin_${this.estudiante.nombreCompleto.replace(/\s+/g, '_')}_${this.year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      this.alerts.toast('Excel generado exitosamente', 'success');
    } catch (error) {
      console.error('Error generando Excel:', error);
      this.alerts.toast('Error al generar Excel', 'error');
    }
  }
}