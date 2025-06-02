// boletin-completo-docente.component.ts
import { Component } from '@angular/core';
import { EstimacionesService } from './services/estimaciones.service';
import { BoletinCompletoResponse, BoletinEstudiante, ResumenBoletin } from './interfaces/estimaciones.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-boletin-completo-docente',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './estimaciones.component.html',
  styleUrls: ['./estimaciones.component.css']
})
export class EstimacionesComponent {
  docente_ci: number = 0;
  materia_id: number = 0;
  curso_id: number = 0;
  year: number = new Date().getFullYear();
  docentes: any[] = [];
  materias: any[] = [];
  cursos: any[] = [];

  resultado!: BoletinCompletoResponse;
  estudiantes: BoletinEstudiante[] = [];
  estudiantesFiltrados: BoletinEstudiante[] = [];
  resumen!: ResumenBoletin;

  // Información adicional para mostrar nombres
  docenteNombre: string = '';
  materiaNombre: string = '';
  cursoNombre: string = '';

  // Paginación y búsqueda
  page: number = 1;
  limit: number = 10;
  searchTerm: string = '';

  cargando: boolean = false;
  error: string = '';

  constructor(
    private boletinService: EstimacionesService,
    private alerts: AlertsService
  ) {}

 

  generarBoletin(): void {
    // Validaciones con alertas específicas
    if (!this.docente_ci) {
      this.alerts.toast('Debe ingresar el CI del docente', 'warning');
      return;
    }
    
    if (!this.materia_id) {
      this.alerts.toast('Debe ingresar el ID de la materia', 'warning');
      return;
    }
    
    if (!this.curso_id) {
      this.alerts.toast('Debe ingresar el ID del curso', 'warning');
      return;
    }

    this.cargando = true;
    this.error = '';
    this.alerts.toast('Generando boletín...', 'info');

    this.boletinService.obtenerBoletinCompleto(
      this.docente_ci,
      this.materia_id,
      this.curso_id,
      this.year
    ).subscribe({      next: (res) => {
        this.resultado = res;
        this.estudiantes = res.estudiantes;
        this.estudiantesFiltrados = [...this.estudiantes];
        this.resumen = res.resumen;
        
        // Extraer información de nombres del resumen
        this.docenteNombre = res.resumen.docente_info?.nombreCompleto || 'Docente no encontrado';
        this.materiaNombre = res.resumen.materia_info?.nombre || 'Materia no encontrada';
        this.cursoNombre = res.resumen.curso_info ? 
          `${res.resumen.curso_info.nombre}${res.resumen.curso_info.paralelo ? ' - ' + res.resumen.curso_info.paralelo : ''} (${res.resumen.curso_info.turno})` 
          : 'Curso no encontrado';
        
        this.cargando = false;
        this.page = 1; // Reset pagination
        this.alerts.toast('Boletín generado exitosamente', 'success');
      },
      error: (err) => {
        this.cargando = false;
        
        // Manejo específico de errores
        if (err.status === 404) {
          this.alerts.toast('Error: Docente no encontrado o no tiene permisos para esta materia', 'error');
        } else if (err.status === 400) {
          this.alerts.toast('Error: Datos incorrectos. Verifique CI del docente, ID de materia e ID de curso', 'error');
        } else if (err.status === 403) {
          this.alerts.toast('Error: El docente no está asignado a esta materia y curso', 'error');
        } else if (err.status === 0) {
          this.alerts.toast('Error: No se puede conectar con el servidor', 'error');
        } else {
          this.alerts.toast('Error al generar el boletín. Verifique los datos ingresados', 'error');
        }
        
        this.error = 'Error al generar el boletín';
      }
    });
  }

  // Método para cambiar el límite de elementos por página
  changeLimit(): void {
    this.page = 1; // Reset a la primera página
  }

  // Método para filtrar estudiantes por período
  searchTable(): void {
    if (!this.searchTerm.trim()) {
      this.estudiantesFiltrados = [...this.estudiantes];
    } else {
      this.estudiantesFiltrados = this.estudiantes.filter(estudiante =>
        estudiante.periodos.some(periodo =>
          `${periodo.anio} - ${periodo.periodo}`.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
    this.page = 1; // Reset pagination when searching
  }
}
