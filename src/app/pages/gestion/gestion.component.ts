import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GestionService } from './services/gestion.service';
import { Gestion } from './interfaces/gestion.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {
  gestiones: Gestion[] = [];
  todasLasGestiones: Gestion[] = [];
  page: number = 1;
  limit: number = 10;

  gestionForm!: FormGroup;
  isEditMode = false;
  modalVisible = false;
  gestionSeleccionada!: Gestion;

  constructor(
    private fb: FormBuilder,
    private gestionService: GestionService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.gestionForm = this.fb.group({
      anio: ['', [Validators.required, Validators.pattern('^\\d{4}$')]],
      periodo: ['', Validators.required]
    });
    this.obtenerGestiones();
  }
  obtenerGestiones(): void {
    this.gestionService.obtenerGestiones().subscribe({
      next: (data) => {
        this.gestiones = data;
        this.todasLasGestiones = data;
        if (data.length === 0) {
          this.alertsService.alertInfo('No se encontraron gestiones registradas', 'Sin datos');
        }
      },
      error: (error) => {
        console.error('Error al cargar gestiones', error);
        this.alertsService.alertError(
          'No se pudieron cargar las gestiones. Por favor, inténtelo de nuevo.',
          'Error al cargar gestiones'
        );
      }
    });
  }

  changeLimit(event: any): void {
    this.limit = +event.target.value;
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.gestiones = searchTerm
      ? this.todasLasGestiones.filter((g) =>
          `${g.anio} ${g.periodo}`.toLowerCase().includes(searchTerm)
        )
      : [...this.todasLasGestiones];
    this.page = 1;
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.gestionForm.reset();
  }
  guardarGestion(): void {
    if (this.gestionForm.invalid) {
      this.gestionForm.markAllAsTouched();
      this.alertsService.alertInfo('Por favor complete todos los campos requeridos correctamente', 'Formulario incompleto');
      return;
    }

    const nuevaGestion: Gestion = this.gestionForm.value;

    this.gestionService.guardarGestion(nuevaGestion).subscribe({
      next: () => {
        this.alertsService.alertSuccess('La gestión ha sido guardada correctamente', 'Gestión guardada');
        this.obtenerGestiones();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar gestión', error);
        this.alertsService.alertError(
          'No se pudo guardar la gestión. Por favor, inténtelo de nuevo.',
          'Error al guardar'
        );
      }
    });
  }

  editarGestion(gestion: Gestion): void {
    this.gestionSeleccionada = gestion;
    this.isEditMode = true;
    this.modalVisible = true;
    this.gestionForm.patchValue(gestion);
  }
  actualizarGestion(): void {
    if (this.gestionForm.invalid || !this.gestionSeleccionada?.id) {
      this.gestionForm.markAllAsTouched();
      this.alertsService.alertInfo('Por favor complete todos los campos requeridos correctamente', 'Formulario incompleto');
      return;
    }

    const gestionActualizada: Gestion = this.gestionForm.value;
    this.gestionService.actualizarGestion(this.gestionSeleccionada.id, gestionActualizada).subscribe({
      next: () => {
        this.alertsService.alertSuccess('La gestión ha sido actualizada correctamente', 'Gestión actualizada');
        this.obtenerGestiones();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al actualizar gestión', error);
        this.alertsService.alertError(
          'No se pudo actualizar la gestión. Por favor, inténtelo de nuevo.',
          'Error al actualizar'
        );
      }
    });
  }
  async eliminarGestion(gestion: Gestion): Promise<void> {
    const confirmacion = await this.alertsService.showConfirmationDialog('Sí, eliminar gestión');
    if (!confirmacion) {
      return;
    }

    this.gestionService.eliminarGestion(gestion.id!).subscribe({
      next: () => {
        this.alertsService.alertSuccess('La gestión ha sido eliminada correctamente', 'Gestión eliminada');
        this.obtenerGestiones();
        this.page = 1;
      },
      error: (error) => {
        console.error('Error al eliminar gestión', error);
        this.alertsService.alertError(
          'No se pudo eliminar la gestión. Por favor, inténtelo de nuevo.',
          'Error al eliminar'
        );
      }
    });
  }

  onSubmit(): void {
    if (this.gestionForm.invalid) {
      this.gestionForm.markAllAsTouched();
      return;
    }
    this.isEditMode ? this.actualizarGestion() : this.guardarGestion();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.gestionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.gestionForm, field);
  }
}
