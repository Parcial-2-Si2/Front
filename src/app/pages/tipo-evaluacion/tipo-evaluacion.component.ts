import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipoEvaluacionService } from './services/tipo-evaluacion.service';
import { TipoEvaluacion } from './interfaces/tipoEvaluacion.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { EvaluacionIntegralService } from '../evaluacion-integral/services/evaluacion-integral.service';
import { EvaluacionIntegral } from '../evaluacion-integral/interfaces/evaluacionIntegral.interface';

@Component({
  selector: 'app-tipo-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './tipo-evaluacion.component.html',
  styleUrls: ['./tipo-evaluacion.component.css']
})
export class TipoEvaluacionComponent implements OnInit {
  tipos: TipoEvaluacion[] = [];
  todosLosTipos: TipoEvaluacion[] = [];
  tipoForm!: FormGroup;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  tipoSeleccionado!: TipoEvaluacion;
  isLoading: boolean = false;

  evaluaciones: EvaluacionIntegral[] = [];

  page = 1;
  limit = 10;

  constructor(
    private fb: FormBuilder,
    private tipoService: TipoEvaluacionService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService,
    private evaluacionIntegralService: EvaluacionIntegralService
  ) {}

  ngOnInit(): void {
    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required],
      evaluacion_integral_id: [null],
    });

    this.tipoService.tiposEvaluacion$.subscribe((data) => {
      this.tipos = data;
      this.todosLosTipos = data;
    });

    this.obtenerTipos();
    this.obtenerEvaluacionesIntegrales();
  }

  obtenerTipos(): void {
    this.tipoService.obtenerTiposEvaluacion().subscribe();
  }

  obtenerEvaluacionesIntegrales(): void {
    this.evaluacionIntegralService.obtenerEvaluaciones().subscribe({
      next: (data) => this.evaluaciones = data,
      error: () => this.alertsService.toast('Error al cargar evaluaciones integrales', 'error')
    });
  }

  getNombreEvaluacionIntegral(id: number | null | undefined): String {
  if (id == null) return 'No asignada';
  const evaluacion = this.evaluaciones.find(e => e.id === id);
  return evaluacion ? evaluacion.nombre : 'No asignada';
}


  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  onSubmit(): void {
    if (this.tipoForm.invalid) {
      this.tipoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.tipoForm.disable();

    const data = this.tipoForm.value;

    if (this.isEditMode) {
      this.tipoService.actualizarTipoEvaluacion(this.tipoSeleccionado.id!, data).subscribe({
        next: () => {
          this.alertsService.toast('Tipo de evaluación actualizado correctamente', 'success');
          this.cerrarModal();
          this.obtenerTipos();
        },
        error: () => {
          this.alertsService.toast('Error al actualizar tipo de evaluación', 'error');
          this.disableLoading();
        }
      });
    } else {
      this.tipoService.guardarTipoEvaluacion(data).subscribe({
        next: () => {
          this.alertsService.toast('Tipo de evaluación creado correctamente', 'success');
          this.cerrarModal();
          this.obtenerTipos();
        },
        error: () => {
          this.alertsService.toast('Error al crear tipo de evaluación', 'error');
          this.disableLoading();
        }
      });
    }
  }

  editarTipo(tipo: TipoEvaluacion): void {
    this.tipoSeleccionado = tipo;
    this.tipoForm.patchValue(tipo);
    this.isEditMode = true;
    this.modalVisible = true;
  }

  eliminarTipo(id: number): void {
    if (confirm('¿Deseas eliminar este tipo de evaluación?')) {
      this.tipoService.eliminarTipoEvaluacion(id).subscribe({
        next: () => {
          this.alertsService.toast('Tipo de evaluación eliminado', 'success');
          this.obtenerTipos();
        },
        error: () => this.alertsService.toast('Error al eliminar tipo de evaluación', 'error'),
      });
    }
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.tipoForm.reset();
    this.tipoForm.enable();
    this.isEditMode = false;
    this.isLoading = false;
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.tipos = searchTerm
      ? this.todosLosTipos.filter(t => t.nombre.toLowerCase().includes(searchTerm))
      : [...this.todosLosTipos];
    this.page = 1;
  }

  disableLoading(): void {
    this.isLoading = false;
    this.tipoForm.enable();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.tipoForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.tipoForm, field);
  }
}
