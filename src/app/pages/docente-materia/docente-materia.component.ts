import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteMateriaService } from './services/docente-materia.service';
import { MateriaService } from '../materia/services/materia.service';
import { DocenteMateria } from './interfaces/docenteMateria.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Docente } from '../docente/interfaces/docente.interface';
import { FormsModule } from '@angular/forms';
import { DocenteService } from '../docente/services/docentes.service';
import { CommonModule } from '@angular/common'; 
import { MateriaCurso } from '../materia-curso/interfaces/materiaCurso.interface';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-docente-detalle',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './docente-materia.component.html',
  styleUrls: ['./docente-materia.component.css']
})
export class DocenteMateriaComponent implements OnInit {
  docenteSeleccionado!: Docente;
  docenteCI!: number;  materiasAsignadas: DocenteMateria[] = [];
  todasLasMaterias: Materia[] = [];
  materiaSeleccionadaId: number | null = null;  editando = false;
  
  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private dmService: DocenteMateriaService,
  private materiaService: MateriaService,
  private docenteService: DocenteService,
  private alertsService: AlertsService
  ) {}ngOnInit(): void {
  this.docenteCI = Number(this.route.snapshot.paramMap.get('ci')); // ← obtiene el CI del parámetro de la ruta
  console.log('🔵 CI del docente seleccionado:', this.docenteCI);
  this.obtenerDocente();
  this.obtenerMaterias();
  this.obtenerAsignacionesPorDocente();
}  obtenerMaterias(): void {
    this.materiaService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.todasLasMaterias = materias;
        console.log('📚 Total de materias disponibles:', this.todasLasMaterias.length);
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
  obtenerNombreMateria(materiaId: number): string {
  const materia = this.todasLasMaterias.find(m => m.id === materiaId);
  return materia ? materia.nombre : 'Materia desconocida';
}

  get materiasDisponibles(): Materia[] {
    const idsAsignados = this.materiasAsignadas.map(asignacion => asignacion.materia_id);
    return this.todasLasMaterias.filter(materia => !idsAsignados.includes(materia.id!));
  }
  obtenerDocente(): void {
  this.docenteService.obtenerDocentePorCI(this.docenteCI).subscribe({
    next: (docente) => {
      this.docenteSeleccionado = docente;
    },
    error: (error) => {
      console.error('Error al obtener los datos del docente', error);
      this.alertsService.alertError(
        'No se pudieron cargar los datos del docente. Por favor, inténtelo de nuevo.',
        'Error al cargar docente'
      );
    }
  });
}  obtenerAsignacionesPorDocente(): void {
  this.dmService.obtenerAsignacionesPorDocente(this.docenteCI).subscribe({
    next: (data) => {
      this.materiasAsignadas = data;
      console.log('🟢 Materias asignadas cargadas:', this.materiasAsignadas);
      console.log('🟢 IDs de asignaciones:', this.materiasAsignadas.map(a => ({id: a.id, materia_id: a.materia_id})));
    },
    error: (error) => {
      console.error('❌ Error cargando asignaciones:', error);
      this.alertsService.alertError(
        'No se pudieron cargar las asignaciones del docente. Por favor, inténtelo de nuevo.',
        'Error al cargar asignaciones'
      );
    }
  });
} asignarMateria(): void {
  if (!this.materiaSeleccionadaId) {
    this.alertsService.alertInfo('Por favor seleccione una materia para asignar', 'Materia no seleccionada');
    return;
  }

 const asignacion: DocenteMateria = {
  docente_ci: Number(this.docenteCI), // ← aseguramos que sea number
  materia_id: Number(this.materiaSeleccionadaId),
  fecha: new Date().toISOString().split('T')[0],
};


  console.log('🟡 Enviando asignación para docente CI:', this.docenteCI);
  console.log('🟡 Asignación completa:', asignacion);

  this.dmService.guardarAsignacion(asignacion).subscribe({
    next: () => {
      console.log('✅ Asignación guardada exitosamente');
      this.alertsService.alertSuccess('La materia ha sido asignada correctamente al docente', 'Materia asignada');
      this.obtenerAsignacionesPorDocente();
      this.materiaSeleccionadaId = null;
    },
    error: (error) => {
      console.error('❌ Error al asignar materia:', error);
      this.alertsService.alertError(
        'No se pudo asignar la materia al docente. Por favor, inténtelo de nuevo.',
        'Error al asignar materia'
      );
    }
  });
}
  async eliminarAsignacion(id: number): Promise<void> {
    console.log('🔴 Intentando eliminar asignación con ID:', id);
    
    if (!id) {
      console.error('❌ ID de asignación no válido:', id);
      this.alertsService.alertInfo('ID de asignación no válido', 'Error de validación');
      return;
    }

    // Obtener el nombre de la materia para la confirmación
    const asignacion = this.materiasAsignadas.find(a => a.id === id);
    const nombreMateria = asignacion ? this.obtenerNombreMateria(asignacion.materia_id) : 'Desconocida';
    
    const confirmacion = await this.alertsService.showConfirmationDialog(`Sí, eliminar asignación de "${nombreMateria}"`);
    if (!confirmacion) {
      return;
    }

    this.dmService.eliminarAsignacion(id).subscribe({
      next: () => {
        console.log('✅ Asignación eliminada exitosamente');
        this.alertsService.alertSuccess('La asignación ha sido eliminada correctamente', 'Asignación eliminada');
        this.obtenerAsignacionesPorDocente();
      },
      error: (error) => {
        console.error('❌ Error al eliminar asignación:', error);
        this.alertsService.alertError(
          'No se pudo eliminar la asignación. Por favor, inténtelo de nuevo.',
          'Error al eliminar asignación'
        );
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/docentes']);
  }
}
