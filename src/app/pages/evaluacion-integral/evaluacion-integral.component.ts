import { Component, OnInit } from '@angular/core';
import { EvaluacionIntegral } from './interfaces/evaluacionIntegral.interface';
import { EvaluacionIntegralService } from './services/evaluacion-integral.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-evaluacion-integral',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './evaluacion-integral.component.html',
  styleUrls: ['./evaluacion-integral.component.css']
})
export class EvaluacionIntegralComponent implements OnInit {
  evaluaciones: EvaluacionIntegral[] = [];
  todasLasEvaluaciones: EvaluacionIntegral[] = [];
  page = 1;
  limit = 10;
  modalVisible = false;
  isEditMode = false;
  evaluacionSeleccionada!: EvaluacionIntegral;
  evaluacionForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private service : EvaluacionIntegralService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
  ) {}

  ngOnInit(): void {
   
    this.evaluacionForm = this.fb.group({
      nombre: ['', Validators.required],
      maxPuntos: ['', [Validators.required, Validators.min(1)]],
    });


    this.service.evaluaciones$.subscribe(data => {
      this.evaluaciones = data;
      this.todasLasEvaluaciones = data;
    });

    this.obtenerEvaluaciones();
  }

  obtenerEvaluaciones(): void {
    this.service.obtenerEvaluaciones().subscribe({
      error: () => this.alertsService.toast('Error al cargar las evaluaciones.', 'error')
    });
  }

  changeLimit(event: any): void {
      this.limit = event.target.value;
  }

  onSubmit(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.evaluacionForm.disable();

    if (this.isEditMode) {
      this.actualizarEvaluacion();
    } else {
      this.guardarEvaluacion();
    }
  }
  actualizarEvaluacion(): void {
    const data = this.evaluacionForm.value;

    this.service.actualizarEvaluacion(this.evaluacionSeleccionada.id!, data).subscribe({
      next: () => {
        this.alertsService.toast('Evaluación actualizada con éxito.',  'success');
        this.cerrarModal();
        this.obtenerEvaluaciones();
      },
      error: () => {
        this.alertsService.toast('Error al actualizar la evaluación.', 'error');
        this.evaluacionForm.enable();
        this.isLoading = false;
      }
    });
  }

  guardarEvaluacion(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }

    const data = this.evaluacionForm.value;

    if (this.isEditMode) {
      this.service.actualizarEvaluacion(this.evaluacionSeleccionada.id!, data).subscribe(() => {
        this.cerrarModal();
        this.obtenerEvaluaciones();
      });
    } else {
      this.service.guardarEvaluacion(data).subscribe(() => {
        this.cerrarModal();
        this.obtenerEvaluaciones();
      });
    }
  }
  

  editarEvaluacion(evaluacion: EvaluacionIntegral): void {
    this.evaluacionSeleccionada = evaluacion;
    this.evaluacionForm.patchValue(evaluacion);
    this.isEditMode = true;
    this.modalVisible = true;
  }

  eliminarEvaluacion(id: number): void {
    if (confirm('¿Deseas eliminar esta evaluación integral?')) {
      this.service.eliminarEvaluacion(id).subscribe({
        next: () => {
          this.alertsService.toast('Evaluación eliminada correctamente.',  'success');
          this.obtenerEvaluaciones();
        },
        error: () => this.alertsService.toast('Error al eliminar la evaluación.', 'error')
      });
    }
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.evaluacionForm.reset();
    this.isEditMode = false;
    this.disableLoading();
    this.evaluacionForm.reset();
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.evaluaciones = searchTerm
      ? this.todasLasEvaluaciones.filter(e => e.nombre.toLowerCase().includes(searchTerm))
      : [...this.todasLasEvaluaciones];
    this.page = 1;
  }

  disableLoading(): void {
    this.isLoading = false;
    this.evaluacionForm.enable();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.evaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.evaluacionForm, field);
  }
}
