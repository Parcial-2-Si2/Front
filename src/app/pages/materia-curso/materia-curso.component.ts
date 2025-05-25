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

@Component({
  selector: 'app-materia-curso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './materia-curso.component.html',
  styleUrls: ['./materia-curso.component.css']
})
export class MateriaCursoComponent implements OnInit {
  cursoSeleccionado!: Curso;
  cursoId!: number;
  materiasAsignadas: MateriaCurso[] = [];
  todasLasMaterias: Materia[] = [];
  materiaSeleccionadaId: number | null = null;
  anioAsignacion: number = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materiaCursoService: MateriaCursoService,
    private materiaService: MateriaService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.cursoId = Number(this.route.snapshot.paramMap.get('id'));
    this.obtenerCurso();
    this.obtenerMaterias();
    this.obtenerAsignaciones();
  }

  obtenerCurso(): void {
    this.cursoService.obtenerCursoPorId(this.cursoId).subscribe({
      next: (curso) => {
        this.cursoSeleccionado = curso;
      },
      error: () => {
        console.error('Error al cargar curso');
      }
    });
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

  obtenerAsignaciones(): void {
  this.materiaService.obtenerMaterias().subscribe({
    next: (materias) => {
      this.todasLasMaterias = materias;

      this.materiaCursoService.obtenerAsignaciones().subscribe({
        next: (asignaciones) => {
          this.materiasAsignadas = asignaciones.map(asignacion => {
            const materia = this.todasLasMaterias.find(m => m.id === asignacion.materia_id);
            return { ...asignacion, materia }; // añadimos el objeto materia al resultado
          });
        },
        error: () => {
          console.error('Error al obtener asignaciones');
        }
      });
    },
    error: () => {
      console.error('Error al obtener materias');
    }
  });
}


  asignarMateria(): void {
    if (!this.materiaSeleccionadaId) return;

    const asignacion = {
      curso_id: this.cursoId,
      materia_id: this.materiaSeleccionadaId,
      anio: this.anioAsignacion || new Date().getFullYear()
    } as MateriaCurso;


    this.materiaCursoService.guardarAsignacion(asignacion).subscribe({
      next: () => {
        this.obtenerAsignaciones();
        this.materiaSeleccionadaId = null;
      },
      error: () => {
        console.error('Error al asignar materia');
      }
    });
  }

  eliminarAsignacion(id?: number): void {
  if (!id) {
    console.error('ID inválido para eliminar');
    return;
  }

  this.materiaCursoService.eliminarAsignacion(id).subscribe({
    next: () => this.obtenerAsignaciones(),
    error: () => console.error('Error al eliminar asignación'),
  });
}


  volver(): void {
    this.router.navigate(['/dashboard/curso']);
  }
}
