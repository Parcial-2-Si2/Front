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
  materiaSeleccionadaId: number | null = null;
  editando = false;
  alertsService: any;
  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private dmService: DocenteMateriaService,
  private materiaService: MateriaService,
  private docenteService: DocenteService
  ) {}  ngOnInit(): void {
  this.docenteCI = Number(this.route.snapshot.paramMap.get('ci')); // ← obtiene el CI del parámetro de la ruta
  console.log('🔵 CI del docente seleccionado:', this.docenteCI);
  this.obtenerDocente();
  this.obtenerMaterias();
  this.obtenerAsignacionesPorDocente();
}
  obtenerMaterias(): void {
    this.materiaService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.todasLasMaterias = materias;
        console.log('📚 Total de materias disponibles:', this.todasLasMaterias.length);
      },
      error: () => {
        console.error('Error al cargar materias');
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
    error: () => {
      console.error('Error al obtener los datos del docente');
    }
  });
}  obtenerAsignacionesPorDocente(): void {
  this.dmService.obtenerAsignacionesPorDocente(this.docenteCI).subscribe({
    next: (data) => {
      this.materiasAsignadas = data;
      console.log('🟢 Materias asignadas cargadas:', this.materiasAsignadas);
      console.log('🟢 IDs de asignaciones:', this.materiasAsignadas.map(a => ({id: a.id, materia_id: a.materia_id})));
    },
    error: (err) => {
      console.error('❌ Error cargando asignaciones:', err);
    }
  });
}
 asignarMateria(): void {
  if (!this.materiaSeleccionadaId) return;

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
      this.obtenerAsignacionesPorDocente();
      this.materiaSeleccionadaId = null;
    },
    error: (err) => {
      console.error('❌ Error al asignar materia:', err);
    }
  });
}

  eliminarAsignacion(id: number): void {
    console.log('🔴 Intentando eliminar asignación con ID:', id);
    
    if (!id) {
      console.error('❌ ID de asignación no válido:', id);
      return;
    }

    // Obtener el nombre de la materia para la confirmación
    const asignacion = this.materiasAsignadas.find(a => a.id === id);
    const nombreMateria = asignacion ? this.obtenerNombreMateria(asignacion.materia_id) : 'Desconocida';
    
    if (confirm(`¿Está seguro de que desea eliminar la asignación de la materia "${nombreMateria}"?`)) {
      this.dmService.eliminarAsignacion(id).subscribe({
        next: () => {
          console.log('✅ Asignación eliminada exitosamente');
          this.obtenerAsignacionesPorDocente();
        },
        error: (err) => {
          console.error('❌ Error al eliminar asignación:', err);
          alert('Error al eliminar la asignación. Por favor, inténtelo de nuevo.');
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/docentes']);
  }
}
