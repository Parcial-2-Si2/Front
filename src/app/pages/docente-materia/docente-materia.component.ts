import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteMateriaService } from './services/docente-materia.service';
import { MateriaService } from '../materia/services/materia.service';
import { DocenteMateria } from './interfaces/docenteMateria.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Docente } from '../docente/interfaces/docente.interface';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../../shared/services/navigation.service';
import { DocenteService } from '../docente/services/docentes.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-docente-detalle',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './docente-materia.component.html',
  styleUrls: ['./docente-materia.component.css']
})
export class DocenteMateriaComponent implements OnInit {
  docenteSeleccionado!: Docente;
  docenteCI!: number;
  materiasAsignadas: DocenteMateria[] = [];
  todasLasMaterias: Materia[] = [];
  materiaSeleccionadaId: number | null = null;
  editando = false;
  alertsService: any;

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private dmService: DocenteMateriaService,
  private materiaService: MateriaService,
  private docenteService: DocenteService,
  private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
  const ciParam = this.route.snapshot.paramMap.get('ci');
  this.docenteCI = ciParam ? Number(ciParam) : 0;  // ← convierte string a number
  this.obtenerDocente();
  this.obtenerMaterias();
  this.obtenerAsignaciones();
}

  obtenerMaterias(): void {
    this.materiaService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.todasLasMaterias = materias;
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

  obtenerDocente(): void {
  this.docenteService.obtenerDocentePorCI(this.docenteCI).subscribe({
    next: (docente) => {
      this.docenteSeleccionado = docente;
    },
    error: () => {
      console.error('Error al obtener los datos del docente');
    }
  });
}

  obtenerAsignaciones(): void {
  console.log('Buscando asignaciones para CI:', this.docenteCI);
  this.dmService.buscarPorDocenteCI(this.docenteCI).subscribe({
    next: (asignaciones) => {
      this.materiasAsignadas = asignaciones;
    },
    error: (err) => {
      console.error('❌ Error al cargar asignaciones:', err);
      if (err.status === 422) {
        this.alertsService.toast('CI inválido o sin formato correcto', 'error');
      }
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


  console.log('🟡 Enviando asignación:', asignacion);

  this.dmService.guardarAsignacion(asignacion).subscribe({
    next: () => {
      this.obtenerAsignaciones();
      this.materiaSeleccionadaId = null;
    },
    error: (err) => {
      console.error('❌ Error al asignar materia:', err);
    }
  });
}

  

  eliminarAsignacion(id: number): void {
    this.dmService.eliminarAsignacion(id).subscribe({
      next: () => this.obtenerAsignaciones(),
      error: () => console.error('Error al eliminar asignación')
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/docentes']);
  }
}
