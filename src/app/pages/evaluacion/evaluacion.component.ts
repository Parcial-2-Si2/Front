import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionService } from './services/evaluacion.service';
import { Evaluacion, EvaluacionDetallada } from './interfaces/evaluacion.interface';
import { GestionService } from '../gestion/services/gestion.service';
import { MateriaService } from '../materia/services/materia.service';
import { EstudianteService } from '../estudiante/services/estudiante.service';
import { Gestion } from '../gestion/interfaces/gestion.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Estudiante } from '../estudiante/interfaces/estudiante.interface';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin } from 'rxjs';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-evaluacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './evaluacion.component.html'
})
export class EvaluacionComponent {
  private evaluacionService = inject(EvaluacionService);
  private gestionService = inject(GestionService);
  private materiaService = inject(MateriaService);
  private estudianteService = inject(EstudianteService);
  private alertsService = inject(AlertsService);

  evaluaciones: EvaluacionDetallada[] = [];
  evaluacionesFiltradas: EvaluacionDetallada[] = [];
  
  // Listas para los filtros
  gestiones: Gestion[] = [];
  materias: Materia[] = [];
  estudiantes: Estudiante[] = [];

  // Filtros
  gestionFiltro: number | null = null;
  materiaFiltro: number | null = null;
  estudianteFiltro: string = ''; // Filtro de texto para estudiante
  descripcionFiltro: string = '';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  
  // Paginación
  page: number = 1;
  limit: number = 10;

  // Estado de carga
  cargando: boolean = false;

  // Exponer Math para usar en el template
  Math = Math;

  ngOnInit() {
    this.cargarDatos();
  }  cargarDatos() {
    this.cargando = true;
    
    // Cargar todas las evaluaciones y datos relacionados
    forkJoin({
      evaluaciones: this.evaluacionService.obtenerEvaluaciones(),
      gestiones: this.gestionService.obtenerGestiones(),
      materias: this.materiaService.obtenerMaterias(),
      estudiantes: this.estudianteService.obtenerEstudiantes()
    }).subscribe({
      next: (data) => {
        this.gestiones = data.gestiones || [];
        this.materias = data.materias || [];
        this.estudiantes = data.estudiantes || [];
        
        // Procesar evaluaciones para agregar información relacionada
        this.evaluaciones = (data.evaluaciones || []).map(ev => this.procesarEvaluacion(ev));
        this.evaluacionesFiltradas = [...this.evaluaciones];
        
        this.cargando = false;
        
        if (this.evaluaciones.length === 0) {
          this.alertsService.toast('No se encontraron evaluaciones', 'info');
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.alertsService.toast('Error al cargar los datos. Mostrando datos de prueba.', 'warning');
        // Cargar datos de prueba como fallback
        this.cargarDatosPrueba();
        this.cargando = false;
      }
    });
  }private procesarEvaluacion(evaluacion: Evaluacion): EvaluacionDetallada {
    // Búsqueda robusta del estudiante (maneja diferentes tipos de datos)
    const estudiante = this.estudiantes.find(e => 
      e.ci === evaluacion.estudiante_ci || 
      e.ci?.toString() === evaluacion.estudiante_ci?.toString()
    );
    const materia = this.materias.find(m => m.id === evaluacion.materia_id);
    const gestion = this.gestiones.find(g => g.id === evaluacion.gestion_id);

    const evaluacionDetallada: EvaluacionDetallada = {
      ...evaluacion,
      estudiante_nombre: estudiante?.nombreCompleto || `CI: ${evaluacion.estudiante_ci}`,
      materia_nombre: materia?.nombre || `ID: ${evaluacion.materia_id}`,
      gestion_detalle: gestion ? `${gestion.anio} - ${gestion.periodo}` : `ID: ${evaluacion.gestion_id}`
    };

    return evaluacionDetallada;
  }
  aplicarFiltros() {
    this.evaluacionesFiltradas = this.evaluaciones.filter(ev => {
      const coincideGestion = this.gestionFiltro ? ev.gestion_id === this.gestionFiltro : true;
      const coincideMateria = this.materiaFiltro ? ev.materia_id === this.materiaFiltro : true;
      const coincideEstudiante = this.estudianteFiltro 
        ? ev.estudiante_nombre?.toLowerCase().includes(this.estudianteFiltro.toLowerCase()) ||
          ev.estudiante_ci?.toString().includes(this.estudianteFiltro)
        : true;
      const coincideDescripcion = this.descripcionFiltro 
        ? ev.descripcion?.toLowerCase().includes(this.descripcionFiltro.toLowerCase())
        : true;

      let coincideFecha = true;
      if (this.fechaInicioFiltro && this.fechaFinFiltro) {
        const fechaEv = new Date(ev.fecha);
        const fechaInicio = new Date(this.fechaInicioFiltro);
        const fechaFin = new Date(this.fechaFinFiltro);
        coincideFecha = fechaEv >= fechaInicio && fechaEv <= fechaFin;
      }
      
      return coincideGestion && coincideMateria && coincideEstudiante && coincideDescripcion && coincideFecha;
    });
    
    this.page = 1; // Reset pagination
  }

  limpiarFiltros() {
    this.gestionFiltro = null;
    this.materiaFiltro = null;
    this.estudianteFiltro = '';
    this.descripcionFiltro = '';
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.evaluacionesFiltradas = [...this.evaluaciones];
    this.page = 1;
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
    this.page = 1;
  }

  private cargarDatosPrueba() {
    // Datos de prueba para verificar que la visualización funciona
    this.estudiantes = [
      { ci: 12345678, nombreCompleto: 'Juan Pérez López' },
      { ci: 87654321, nombreCompleto: 'María García Rodríguez' },
      { ci: 11223344, nombreCompleto: 'Carlos Silva Mendoza' }
    ];
    
    this.materias = [
      { id: 1, nombre: 'Matemáticas', descripcion: 'Matemáticas básicas', codigo: 'MAT101' },
      { id: 2, nombre: 'Física', descripcion: 'Física general', codigo: 'FIS101' }
    ];
    
    this.gestiones = [
      { id: 1, anio: 2024, periodo: 'I' },
      { id: 2, anio: 2024, periodo: 'II' }
    ];
    
    const evaluacionesPrueba: Evaluacion[] = [
      {
        id: 1,
        descripcion: 'Primer Parcial',
        fecha: '2024-06-01',
        nota: 85,
        tipo_evaluacion_id: 1,
        estudiante_ci: 12345678,
        materia_id: 1,
        gestion_id: 1
      },
      {
        id: 2,
        descripcion: 'Segundo Parcial',
        fecha: '2024-06-15',
        nota: 90,
        tipo_evaluacion_id: 1,
        estudiante_ci: 87654321,
        materia_id: 2,
        gestion_id: 1
      },
      {
        id: 3,
        descripcion: 'Laboratorio',
        fecha: '2024-06-20',
        nota: 78,
        tipo_evaluacion_id: 2,
        estudiante_ci: 11223344,
        materia_id: 1,
        gestion_id: 2
      }
    ];
      this.evaluaciones = evaluacionesPrueba.map(ev => this.procesarEvaluacion(ev));
    this.evaluacionesFiltradas = [...this.evaluaciones];
  }
}
