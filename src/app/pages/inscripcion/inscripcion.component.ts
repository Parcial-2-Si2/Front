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

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule]
})
export class InscripcionComponent implements OnInit {
  inscripciones: Inscripcion[] = [];
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

  constructor(
    private inscripcionService: InscripcionService,
    private cursoService: CursoService,
    private estudianteService: EstudianteService,
    private fb: FormBuilder
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
  }

  obtenerInscripciones(): void {
    this.inscripcionService.obtenerInscripciones().subscribe({
      next: (data) => this.inscripciones = data,
      error: () => console.error('Error al obtener inscripciones')
    });
  }

  obtenerCursos(): void {
    this.cursoService.obtenerCursos().subscribe({
      next: (data) => this.cursos = data,
      error: () => console.error('Error al obtener cursos')
    });
  }

  obtenerEstudiantes(): void {
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: (data) => this.estudiantes = data,
      error: () => console.error('Error al obtener estudiantes')
    });
  }

  guardarInscripcion(): void {
    if (this.inscripcionForm.invalid) return;

    const nuevaInscripcion: Inscripcion = this.inscripcionForm.value;

    this.inscripcionService.guardarInscripcion(nuevaInscripcion).subscribe({
      next: () => {
        this.obtenerInscripciones();
        this.cerrarModal();
      },
      error: () => console.error('Error al guardar inscripción')
    });
  }

  editarInscripcion(inscripcion: Inscripcion): void {
    this.inscripcionSeleccionada = inscripcion;
    this.isEditMode = true;
    this.modalVisible = true;
    this.inscripcionForm.patchValue(inscripcion);
  }

  actualizarInscripcion(): void {
    if (this.inscripcionForm.invalid) return;

    const datosActualizados: Inscripcion = this.inscripcionForm.value;

    this.inscripcionService.actualizarInscripcion(this.inscripcionSeleccionada.id!, datosActualizados).subscribe({
      next: () => {
        this.obtenerInscripciones();
        this.cerrarModal();
      },
      error: () => console.error('Error al actualizar inscripción')
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
    error: () => { console.error('Error al obtener los datos del estudiante'); }
  });

  this.cursoService.obtenerCursoPorId(inscripcion.curso_id).subscribe({
    next: (curso) => {
      this.cursoSeleccionado = curso;
      cursoCargado = true;
      this.mostrarModalSiListo(estudianteCargado, cursoCargado);
    },
    error: () => { console.error('Error al cargar curso'); }
  });
}

mostrarModalSiListo(estudianteCargado: boolean, cursoCargado: boolean): void {
  if (this.estudianteSeleccionado && this.cursoSeleccionado) {
    this.modalVerVisible = true;
  }
}



  eliminarInscripcion(inscripcion: Inscripcion): void {
    this.inscripcionService.eliminarInscripcion(inscripcion.id!).subscribe({
      next: () => this.obtenerInscripciones(),
      error: () => console.error('Error al eliminar inscripción')
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

}
