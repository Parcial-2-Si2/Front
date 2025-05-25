import { Component, OnInit } from '@angular/core';
import { Curso } from './interfaces/curso.interface';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CursoService } from './services/curso.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './curso.component.html',
  styleUrl: './curso.component.css'
})
export class CursoComponent implements OnInit {
  page = 1;
  limit = 10;
  cursos: Curso[] = [];
  todosLosCursos: Curso[] = [];
  cursoForm!: FormGroup;
  isEditMode = false;
  modalVisible = false;
  curso!: Curso;

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private cursoService: CursoService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.cursoService.cursos$.subscribe((data) => {
      this.cursos = data;
      this.todosLosCursos = data;
    });

    this.cursoForm = this.fb.group({
      nombre: ['', Validators.required],
      Paralelo: ['', Validators.required],
      Turno: ['', Validators.required],
      Nivel: ['', Validators.required],
      descripcion: [''],
    });

    this.obtenerCursos();
  }

  obtenerCursos(): void {
    this.cursoService.obtenerCursos().subscribe({
      next: () => {},
      error: (err) => this.alertsService.toast(err, 'error'),
    });
  }

  changeLimit(event: any): void {
    this.limit = +event.target.value;
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.cursos = searchTerm
      ? this.todosLosCursos.filter((c) =>
          c.nombre.toLowerCase().includes(searchTerm)
        )
      : [...this.todosLosCursos];
    this.page = 1;
  }

 guardarCurso(): void {
  if (this.cursoForm.invalid) {
    this.cursoForm.markAllAsTouched();
    return;
  }

  const nuevoCurso: Curso = this.cursoForm.value;

  console.log(nuevoCurso); // 🧪 verifica aquí que los nombres estén correctos

  this.cursoService.guardarCurso(nuevoCurso).subscribe({
    next: () => {
      this.alertsService.toast('Curso guardado con éxito', 'success');
      this.obtenerCursos();
      this.cerrarModal();
    },
    error: (err) => {
      console.error('Error guardando curso:', err);
      this.alertsService.toast(err, 'error');
    },
  });
}



  editarCurso(curso: Curso): void {
    this.curso = curso;
    this.isEditMode = true;
    this.modalVisible = true;
    this.cursoForm.patchValue(curso);
  }

  actualizarCurso(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }

    const cursoActualizado: Curso = this.cursoForm.value;
    this.cursoService.actualizarCurso(this.curso.id!, cursoActualizado).subscribe({
      next: () => {
        this.alertsService.toast('Curso actualizado con éxito', 'success');
        this.obtenerCursos();
        this.cerrarModal();
      },
      error: (err) => this.alertsService.toast(err, 'error'),
    });
  }

  eliminarCurso(curso: Curso): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.cursoService.eliminarCurso(curso.id!).subscribe({
          next: () => {
            this.obtenerCursos();
            this.alertsService.toast('Curso eliminado correctamente', 'success');
            this.page = 1;
          },
          error: (err) => this.alertsService.toast(err, 'error'),
        });
      }
    });
  }

  onSubmit(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }
    this.isEditMode ? this.actualizarCurso() : this.guardarCurso();
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.cursoForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.cursoForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.cursoForm, field);
  }

  verDetalle(curso: Curso): void {
      // Navegar a la ruta de detalle del docente
      this.navigationService.setOrigen('curso');
      this.router.navigate(['/dashboard/materia-curso', curso.id]);
  }
}
