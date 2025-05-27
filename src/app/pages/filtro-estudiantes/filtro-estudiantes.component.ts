import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Estudiante } from '../estudiante/interfaces/estudiante.interface';
import { FiltroEstudiantesService } from './services/filtro-estudiantes.service';
import { Curso } from '../curso/interfaces/curso.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Docente } from '../auth/interfaces/docente.interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../shared/services/navigation.service';

@Component({
  selector: 'app-filtro-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-estudiantes.component.html',
  styleUrls: ['./filtro-estudiantes.component.css']
})
export class FiltroEstudiantesComponent implements OnInit {
  estudiantesFiltrados: (Estudiante & {
    asistio?: boolean;
    falta?: boolean;
    licencia?: boolean;
    justificacion?: string;
  })[] = [];

  docente_ci!: number;
  materia_id!: number;
  curso_id!: number;
  fechaHoy: string = new Date().toISOString().split('T')[0];

  docenteSeleccionado!: Docente;
  materiaSeleccionada!: Materia;
  cursoSeleccionado!: Curso;

  modalVisible: boolean = false;
  estudianteSeleccionado: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filtroService: FiltroEstudiantesService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.docente_ci = Number(params['docente_ci']);
      this.materia_id = Number(params['materia_id']);
      this.curso_id = Number(params['curso_id']);

      // Obtener entidades desde NavigationService
      this.docenteSeleccionado = this.navigationService.getUsuario() ?? { nombreCompleto: 'Desconocido' } as Docente;
      this.materiaSeleccionada = this.navigationService.getMateriaActual() ?? { nombre: 'Desconocido' } as Materia;
      this.cursoSeleccionado = this.navigationService.getCursoActual() ?? { nombre: 'Desconocido', descripcion: '' } as Curso;

      this.cargarEstudiantes();
    });
  }

  cargarEstudiantes(): void {
    this.filtroService.filtrarEstudiantes(this.docente_ci, this.materia_id, this.curso_id).subscribe({
      next: (estudiantes) => {
        if (Array.isArray(estudiantes)) {
          this.estudiantesFiltrados = estudiantes.map(e => ({
            ...e,
            asistio: false,
            falta: false,
            licencia: false,
            justificacion: ''
          }));
        } else {
          console.error('⚠️ Respuesta inesperada:', estudiantes);
        }
      },
      error: (err) => {
        console.error('❌ Error al filtrar estudiantes:', err);
      }
    });
  }

  abrirJustificacionModal(estudiante: any): void {
    this.estudianteSeleccionado = estudiante;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.estudianteSeleccionado = null;
  }

  guardarJustificacion(): void {
    this.cerrarModal();
  }

  volver(): void {
    this.router.navigate(['/dashboard/curso']);
  }
}
