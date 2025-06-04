import { Component, OnInit } from '@angular/core';
import { InscripcionService } from './service/inscripcion.service';
import { CursoService } from '../curso/services/curso.service';
import { EstudianteService } from '../estudiante/services/estudiante.service';
import { Inscripcion } from './interfaces/inscripcion.interface';
import { Curso } from '../curso/interfaces/curso.interface';
import { Estudiante } from '../estudiante/interfaces/estudiante.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule]
})
export class InscripcionComponent implements OnInit {
  inscripciones: Inscripcion[] = [];
  inscripcionesFiltradas: Inscripcion[] = [];
  estudiantes: Estudiante[] = [];
  cursos: Curso[] = [];
  inscripcionForm!: FormGroup;
  modalVisible = false;
  isEditMode = false;
  inscripcionSeleccionada!: Inscripcion;
  estudianteSeleccionado!: Estudiante;
  cursoSeleccionado?: Curso;
  modalVerVisible = false;
  page = 1;
  limit = 10;
  searchTerm = '';
  constructor(
    private inscripcionService: InscripcionService,
    private cursoService: CursoService,
    private estudianteService: EstudianteService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.inscripcionForm = this.fb.group({
      descripcion: [''],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      estudiante_ci: [null, Validators.required],
      curso_id: [null, Validators.required]
    });

    this.obtenerInscripciones();
    this.obtenerCursos();
    this.obtenerEstudiantes();
  }  obtenerInscripciones(): void {
    this.inscripcionService.obtenerInscripciones().subscribe({
      next: (data) => {
        this.inscripciones = data;
        this.inscripcionesFiltradas = [...data];
      },
      error: (error) => {
        console.error('Error al obtener inscripciones:', error);
        this.alertsService.toast('Error al cargar inscripciones', 'error');
      }
    });
  }

  obtenerCursos(): void {
    this.cursoService.obtenerCursos().subscribe({
      next: (data) => this.cursos = data,
      error: (error) => {
        console.error('Error al obtener cursos:', error);
        this.alertsService.toast('Error al cargar cursos', 'error');
      }
    });
  }

  obtenerEstudiantes(): void {
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: (data) => this.estudiantes = data,
      error: (error) => {
        console.error('Error al obtener estudiantes:', error);
        this.alertsService.toast('Error al cargar estudiantes', 'error');
      }
    });
  }
  guardarInscripcion(): void {
    if (this.inscripcionForm.invalid) {
      this.inscripcionForm.markAllAsTouched();
      this.alertsService.toast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    const nuevaInscripcion: Inscripcion = this.inscripcionForm.value;

    this.inscripcionService.guardarInscripcion(nuevaInscripcion).subscribe({
      next: () => {
        this.alertsService.toast('Inscripción guardada exitosamente', 'success');
        this.obtenerInscripciones();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar inscripción:', error);
        this.alertsService.toast('Error al guardar la inscripción', 'error');
      }
    });
  }

  editarInscripcion(inscripcion: Inscripcion): void {
    this.inscripcionSeleccionada = inscripcion;
    this.isEditMode = true;
    this.modalVisible = true;
    this.inscripcionForm.patchValue(inscripcion);
  }
  actualizarInscripcion(): void {
    if (this.inscripcionForm.invalid) {
      this.inscripcionForm.markAllAsTouched();
      this.alertsService.toast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    const datosActualizados: Inscripcion = this.inscripcionForm.value;

    this.inscripcionService.actualizarInscripcion(this.inscripcionSeleccionada.id!, datosActualizados).subscribe({
      next: () => {
        this.alertsService.toast('Inscripción actualizada exitosamente', 'success');
        this.obtenerInscripciones();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al actualizar inscripción:', error);
        this.alertsService.toast('Error al actualizar la inscripción', 'error');
      }
    });
  }
  verInscripcion(inscripcion: Inscripcion): void {
  this.inscripcionSeleccionada = inscripcion;

  let estudianteCargado = false;
  let cursoCargado = false;
  this.estudianteService.obtenerPorCI(inscripcion.estudiante_ci).subscribe({
    next: (estudiante) => {
      this.estudianteSeleccionado = estudiante;
      estudianteCargado = true;
      this.mostrarModalSiListo(estudianteCargado, cursoCargado);
    },
    error: (error) => {
      console.error('Error al obtener los datos del estudiante:', error);
      this.alertsService.toast('Error al cargar datos del estudiante', 'error');
    }
  });

  this.cursoService.obtenerCursoPorId(inscripcion.curso_id).subscribe({
    next: (curso) => {
      this.cursoSeleccionado = curso;
      cursoCargado = true;
      this.mostrarModalSiListo(estudianteCargado, cursoCargado);
    },
    error: (error) => {
      console.error('Error al cargar curso:', error);
      this.alertsService.toast('Error al cargar datos del curso', 'error');
    }
  });
}

mostrarModalSiListo(estudianteCargado: boolean, cursoCargado: boolean): void {
  if (this.estudianteSeleccionado && this.cursoSeleccionado) {
    this.modalVerVisible = true;
  }
}


  eliminarInscripcion(inscripcion: Inscripcion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.inscripcionService.eliminarInscripcion(inscripcion.id!).subscribe({
          next: () => {
            this.alertsService.toast('Inscripción eliminada exitosamente', 'success');
            this.obtenerInscripciones();
          },
          error: (error) => {
            console.error('Error al eliminar inscripción:', error);
            this.alertsService.toast('Error al eliminar la inscripción', 'error');
          }
        });
      }
    });
  }

  abrirModal(): void {
    this.modalVisible = true;
    this.inscripcionForm.reset({
      fecha: new Date().toISOString().split('T')[0]
    });
    this.isEditMode = false;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.inscripcionForm.reset();
  }

  onSubmit(): void {
    this.isEditMode ? this.actualizarInscripcion() : this.guardarInscripcion();
  }
  getNombreEstudiante(ci: number): string {
  const estudiante = this.estudiantes.find(e => e.ci.toString() === ci.toString());
  return estudiante ? estudiante.nombreCompleto : 'Estudiante no encontrado';
}


getDescripcionCurso(id: number): string {
  const curso = this.cursos.find(c => c.id === id);
  return curso
    ? `${curso.nombre}` : 'Curso no encontrado';
}

changeLimit(event: any): void {
  this.limit = parseInt(event.target.value);
  this.page = 1;
}

searchTable(event: any): void {
  this.searchTerm = event.target.value.toLowerCase();
  if (this.searchTerm) {
    this.inscripcionesFiltradas = this.inscripciones.filter(inscripcion =>
      this.getNombreEstudiante(inscripcion.estudiante_ci).toLowerCase().includes(this.searchTerm)
    );
  } else {
    this.inscripcionesFiltradas = [...this.inscripciones];
  }
  this.page = 1;
}

  // Métodos de validación
  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.inscripcionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.inscripcionForm, field);
  }
}
