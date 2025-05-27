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
      },
      error: (err) => this.alertsService.toast(err, 'error')
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
      return;
    }

    const nuevaGestion: Gestion = this.gestionForm.value;

    this.gestionService.guardarGestion(nuevaGestion).subscribe({
      next: () => {
        this.alertsService.toast('Gestión guardada con éxito', 'success');
        this.obtenerGestiones();
        this.cerrarModal();
      },
      error: (err: any) => this.alertsService.toast(err, 'error')
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
      return;
    }

    const gestionActualizada: Gestion = this.gestionForm.value;
    this.gestionService.actualizarGestion(this.gestionSeleccionada.id, gestionActualizada).subscribe({
      next: () => {
        this.alertsService.toast('Gestión actualizada con éxito', 'success');
        this.obtenerGestiones();
        this.cerrarModal();
      },
      error: (err) => this.alertsService.toast(err, 'error')
    });
  }

  eliminarGestion(gestion: Gestion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.gestionService.eliminarGestion(gestion.id!).subscribe({
          next: () => {
            this.obtenerGestiones();
            this.alertsService.toast('Gestión eliminada correctamente', 'success');
            this.page = 1;
          },
          error: (err) => this.alertsService.toast(err, 'error')
        });
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
