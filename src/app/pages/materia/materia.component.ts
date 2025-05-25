import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MateriaService } from './services/materia.service';
import { Materia } from './interfaces/materia.interfaces';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './materia.component.html',
  styleUrl: './materia.component.css'
})
export class MateriaComponent implements OnInit {
  page = 1;
  limit = 10;
  materias: Materia[] = [];
  todasLasMaterias: Materia[] = [];
  materiaForm!: FormGroup;
  isEditMode = false;
  modalVisible = false;
  materia!: Materia;

  constructor(
    private fb: FormBuilder,
    private materiaService: MateriaService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.materiaService.materias$.subscribe((data) => {
      this.materias = data;
      this.todasLasMaterias = data;
    });

    this.materiaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
    });

    this.obtenerMaterias();
  }

  obtenerMaterias(): void {
    this.materiaService.obtenerMaterias().subscribe({
      next: () => {},
      error: (err) => this.alertsService.toast(err, 'error'),
    });
  }

  changeLimit(event: any): void {
    this.limit = +event.target.value;
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.materias = searchTerm
      ? this.todasLasMaterias.filter((m) => m.nombre.toLowerCase().includes(searchTerm))
      : [...this.todasLasMaterias];
    this.page = 1;
  }

  guardarMateria(): void {
    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }

    const nuevaMateria: Materia = this.materiaForm.value;
    this.materiaService.guardarMateria(nuevaMateria).subscribe({
      next: () => {
        this.alertsService.toast('Materia guardada con éxito', 'success');
        this.obtenerMaterias();
        this.cerrarModal();
      },
      error: (err) => this.alertsService.toast(err, 'error'),
    });
  }

  editarMateria(materia: Materia): void {
    this.materia = materia;
    this.isEditMode = true;
    this.modalVisible = true;
    this.materiaForm.patchValue(materia);
  }

  actualizarMateria(): void {
    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }

    const materiaActualizada: Materia = this.materiaForm.value;
    this.materiaService.actualizarMateria(this.materia.id!, materiaActualizada).subscribe({
      next: () => {
        this.alertsService.toast('Materia actualizada con éxito', 'success');
        this.obtenerMaterias();
        this.cerrarModal();
      },
      error: (err) => this.alertsService.toast(err, 'error'),
    });
  }

  eliminarMateria(materia: Materia): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.materiaService.eliminarMateria(materia.id!).subscribe({
          next: () => {
            this.obtenerMaterias();
            this.alertsService.toast('Materia eliminada correctamente', 'success');
            this.page = 1;
          },
          error: (err) => this.alertsService.toast(err, 'error'),
        });
      }
    });
  }

  onSubmit(): void {
    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }
    this.isEditMode ? this.actualizarMateria() : this.guardarMateria();
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.materiaForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.materiaForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.materiaForm, field);
  }
}
