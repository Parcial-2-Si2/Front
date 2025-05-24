import { Component } from '@angular/core';
import { Estudiante } from './interfaces/estudiante.interface';
import { EstudianteService } from './services/estudiante.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

const IMAGE_PREVIEW: string = '/assets/img/image-placeholder.png';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './estudiante.component.html',
  styleUrls: ['./estudiante.component.css'],
})
export class EstudianteComponent {
  page: number = 1;
  limit: number = 10;

  estudiantes: Estudiante[] = [];
  todosLosEstudiantes: Estudiante[] = [];
  estudiante!: Estudiante;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  estudianteForm!: FormGroup;

  imagePreview!: string;
  imagen?: File;
  isLoading: boolean = false;
  imagenSeleccionada: boolean = false;


  constructor(
    private estudianteService: EstudianteService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadImagePreview();

    this.estudianteService.estudiantes$.subscribe((estudiantes) => {
      this.estudiantes = estudiantes;
      this.todosLosEstudiantes = estudiantes;
    });

    this.estudianteForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      ci: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      telefono: [''],
      apoderado: [''],
      imagen: [''],
    });
    this.obtenerEstudiantes();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  getImageDefault(): string {
    return IMAGE_PREVIEW;
  }

  searchTable(event: Event): void {
  const target = event.target as HTMLInputElement;
  const searchTerm = target.value.toLowerCase();

  if (searchTerm === '') {
    this.estudiantes = [...this.todosLosEstudiantes];
  } else {
    this.estudiantes = this.todosLosEstudiantes.filter((estudiante) =>
      estudiante.nombreCompleto.toLowerCase().includes(searchTerm) ||
      estudiante.ci.toString().toLowerCase().includes(searchTerm)
    );
  }
  this.page = 1;
}


  onSubmit(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.estudianteForm.disable();

    if (this.isEditMode) {
      this.actualizarEstudiante();
    } else {
      this.guardarEstudiante();
    }
  }

  obtenerEstudiantes(): void {
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: () => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  guardarEstudiante(): void {
    const formData = new FormData();
    formData.append('nombreCompleto', this.estudianteForm.get('nombreCompleto')?.value);
    formData.append('ci', this.estudianteForm.get('ci')?.value);
    formData.append('fechaNacimiento', this.estudianteForm.get('fechaNacimiento')?.value);
    formData.append('telefono', this.estudianteForm.get('telefono')?.value || '');
    formData.append('apoderado', this.estudianteForm.get('apoderado')?.value || '');

    if (this.imagen) {
      formData.append('file', this.imagen);
    }

    this.estudianteService.guardarEstudiante(formData).subscribe({
      next: () => {
        this.obtenerEstudiantes();
        this.cerrarModal();
        this.alertsService.toast('Estudiante guardado correctamente', 'success');
      },
      error: (error: any) => {
        this.disableLoading();
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarEstudiante(): void {
    const formData = this.estudianteForm.value;
    this.estudianteService.actualizarEstudiante(this.estudiante.ci, formData).subscribe({
      next: () => {
        this.obtenerEstudiantes();
        this.cerrarModal();
        this.alertsService.toast('Estudiante actualizado correctamente', 'success');
      },
      error: (error: any) => {
        this.disableLoading();
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarEstudiante(estudiante: Estudiante): void {
    this.isEditMode = true;
    this.estudiante = estudiante;
    this.estudianteForm.patchValue({
      nombreCompleto: estudiante.nombreCompleto,
      ci: estudiante.ci,
      fechaNacimiento: estudiante.fechaNacimiento,
      telefono: estudiante.telefono,
      apoderado: estudiante.apoderado,
    });
    this.imagePreview = estudiante.imagen_url || IMAGE_PREVIEW;
    this.abrirModal();
  }

  eliminarEstudiante(estudiante: Estudiante): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.estudianteService.eliminarEstudiante(estudiante.ci).subscribe({
          next: () => {
            this.obtenerEstudiantes();
            this.alertsService.toast('Estudiante eliminado correctamente', 'success');
            this.page = 1;
          },
          error: (error: any) => {
            this.alertsService.toast(error, 'error');
          },
        });
      }
    });
  }


  loadImagePreview(): void {
    this.imagePreview = IMAGE_PREVIEW;
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.imagen = file;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
    }
  }

  onDeleteImage(): void {
    this.imagePreview = IMAGE_PREVIEW;
    this.imagen = undefined;
    this.estudianteForm.patchValue({ imagen: '' });
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.imagen = undefined;
    this.imagePreview = IMAGE_PREVIEW;
    this.disableLoading();
    this.estudianteForm.reset();
  }

  disableLoading(): void {
    this.isLoading = false;
    this.estudianteForm.enable();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.estudianteForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.estudianteForm, field);
  }
}
