import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MateriaCursoService } from './service/materia-curso.service';
import { MateriaService } from '../materia/services/materia.service';
import { CursoService } from '../curso/services/curso.service';
import { MateriaCurso } from './interfaces/materiaCurso.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Curso } from '../curso/interfaces/curso.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NavigationService } from '../../../shared/services/navigation.service';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-materia-curso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './materia-curso.component.html',
  styleUrls: ['./materia-curso.component.css']
})
export class MateriaCursoComponent implements OnInit {
  cursoSeleccionado!: Curso;
  cursoId!: number;
  materiasAsignadas: MateriaCurso[] = [];
  materiasAsignadasFiltradas: MateriaCurso[] = [];
  todasLasMaterias: Materia[] = [];
  materiasDisponibles: Materia[] = [];
  materiaSeleccionadaId: number | null = null;
  anioAsignacion: number = new Date().getFullYear();
  asignacionSeleccionada!: MateriaCurso;
  isEditMode: boolean = false;
  isDocente: boolean = false;
  page = 1;
  limit = 10;
  searchTerm = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materiaCursoService: MateriaCursoService,
    private materiaService: MateriaService,
    private cursoService: CursoService,
    private navigationService: NavigationService,
    private alertsService: AlertsService
  ) {}
  ngOnInit(): void {
    this.cursoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isDocente = this.navigationService.getUsuario()?.esDocente || false;
    this.obtenerCurso();
   // Primero cargamos materias, luego asignaciones
    this.materiaService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.todasLasMaterias = materias;
        this.obtenerAsignaciones(); // se ejecuta solo cuando ya tenemos las materias
      },
      error: (error) => {
        console.error('Error al obtener materias', error);
        this.alertsService.alertError(
          'No se pudieron cargar las materias. Por favor, recargue la página.',
          'Error de carga inicial'
        );
      }
    });
  }obtenerCurso(): void {
    this.cursoService.obtenerCursoPorId(this.cursoId).subscribe({
      next: (curso) => {
        this.cursoSeleccionado = curso;
      },
      error: (error) => {
        console.error('Error al cargar curso', error);
        this.alertsService.alertError(
          'No se pudo cargar la información del curso. Por favor, inténtelo de nuevo.',
          'Error al cargar curso'
        );
      }
    });
  }
  obtenerMaterias(): void {
    this.materiaService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.todasLasMaterias = materias;
        this.actualizarMateriasDisponibles();
      },
      error: (error) => {
        console.error('Error al cargar materias', error);
        this.alertsService.alertError(
          'No se pudieron cargar las materias disponibles. Por favor, inténtelo de nuevo.',
          'Error al cargar materias'
        );
      }
    });
  }

 actualizarMateriasDisponibles(): void {
  const idsAsignados = this.materiasAsignadas.map(a => a.materia_id);

  this.todasLasMaterias = this.todasLasMaterias
    .filter(m => typeof m.id === 'number' && !idsAsignados.includes(m.id));
}

  obtenerAsignaciones(): void {
    this.materiaCursoService.obtenerAsignaciones().subscribe({
      next: (asignaciones) => {
        const asignacionesCurso = asignaciones.filter(a => a.curso_id === this.cursoId);
        this.materiasAsignadas = asignacionesCurso.map(asignacion => {
          const materia = this.todasLasMaterias.find(m => m.id === asignacion.materia_id);
          return { ...asignacion, materia };
        });
        this.materiasAsignadasFiltradas = [...this.materiasAsignadas];
        this.actualizarMateriasDisponibles();
      },
      error: (error) => {
        console.error('Error al obtener asignaciones', error);
        this.alertsService.alertError(
          'No se pudieron cargar las asignaciones de materias. Por favor, inténtelo de nuevo.',
          'Error al cargar asignaciones'
        );
      }
    });
  }
  asignarMateria(): void {
    if (!this.materiaSeleccionadaId) {
      this.alertsService.alertInfo('Por favor seleccione una materia para asignar', 'Materia no seleccionada');
      return;
    }

    const asignacion = {
      curso_id: this.cursoId,
      materia_id: this.materiaSeleccionadaId,
      anio: this.anioAsignacion || new Date().getFullYear()
    } as MateriaCurso;

    this.materiaCursoService.guardarAsignacion(asignacion).subscribe({
      next: () => {
        this.alertsService.alertSuccess('La materia ha sido asignada correctamente al curso', 'Materia asignada');
        this.obtenerAsignaciones();
        this.materiaSeleccionadaId = null;
      },
      error: (error) => {
        console.error('Error al asignar materia', error);
        this.alertsService.alertError(
          'No se pudo asignar la materia al curso. Por favor, inténtelo de nuevo.',
          'Error al asignar materia'
        );
      }
    });
  }
  async eliminarAsignacion(id?: number): Promise<void> {
    if (!id) {
      this.alertsService.alertInfo('ID de asignación no válido', 'Error de validación');
      return;
    }

    const confirmacion = await this.alertsService.showConfirmationDialog('Sí, eliminar asignación');
    if (!confirmacion) {
      return;
    }

    this.materiaCursoService.eliminarAsignacion(id).subscribe({
      next: () => {
        this.alertsService.alertSuccess('La asignación ha sido eliminada correctamente', 'Asignación eliminada');
        this.obtenerAsignaciones();
      },
      error: (error) => {
        console.error('Error al eliminar asignación', error);
        this.alertsService.alertError(
          'No se pudo eliminar la asignación. Por favor, inténtelo de nuevo.',
          'Error al eliminar asignación'
        );
      }
    });
  }

  verLista(asignacion: MateriaCurso): void {
  const materia_id = asignacion.materia_id;
  const curso_id = asignacion.curso_id;
  const docente_ci = this.navigationService.getDocenteCI();

  this.navigationService.setOrigen('materiaCurso');
  this.navigationService.setCursoActual(this.cursoSeleccionado);
  if (asignacion.materia) {
    this.navigationService.setMateriaActual(asignacion.materia);
  }

  this.router.navigate(['/dashboard/filtrar-estudiantes'], {
    queryParams: {
      docente_ci,
      materia_id,
      curso_id
    }
  });
}

changeLimit(event: any): void {
  this.limit = parseInt(event.target.value);
  this.page = 1;
}

searchTable(event: any): void {
  this.searchTerm = event.target.value.toLowerCase();
  if (this.searchTerm) {
    this.materiasAsignadasFiltradas = this.materiasAsignadas.filter(asignacion =>
      asignacion.materia?.nombre?.toLowerCase().includes(this.searchTerm)
    );
  } else {
    this.materiasAsignadasFiltradas = [...this.materiasAsignadas];
  }
  this.page = 1;
}

  volver(): void {
    this.router.navigate(['/dashboard/curso']);
  }
}
