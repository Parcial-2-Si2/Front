import { Component, OnInit } from '@angular/core';
import { Docente } from './interfaces/docente.interface';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { DocenteService } from './services/docentes.service';

@Component({
  selector: 'app-docentes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './docente.component.html',
  styleUrl: './docente.component.css',
})
export class DocenteComponent {
  page: number = 1;
  limit: number = 10;

  docentes: Docente[] = [];
  todosLosDocentes: Docente[] = [];
  docente!: Docente;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  docenteForm!: FormGroup;
  navigationService: any;
  router: any;

  constructor(
    private docenteService: DocenteService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.docenteService.docentes$.subscribe((docentes) => {
      this.docentes = docentes;
      this.todosLosDocentes = docentes;
    });

    this.docenteForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      ci: ['', Validators.required],
      gmail: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      esDocente: [true, Validators.required]
    });

    this.obtenerDocentes();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      this.docentes = [...this.todosLosDocentes];
    } else {
      this.docentes = this.todosLosDocentes.filter(
        (docente) =>
          docente.nombreCompleto.toLowerCase().includes(searchTerm) ||
          docente.gmail.toLowerCase().includes(searchTerm) 
      );
    }
    this.page = 1;
  }
  filtrarPorRol(event: any): void {
  const valorSeleccionado = event.target.value;

  if (valorSeleccionado === '') {
    // Mostrar todos si es "Todos"
    this.docentes = [...this.todosLosDocentes];
  } else {
    const esDocente = valorSeleccionado === 'true';
    this.docentes = this.todosLosDocentes.filter(d => d.esDocente === esDocente);
  }

  this.page = 1; // Reinicia la paginación
}


  obtenerDocentes(): void {
    this.docenteService.obtenerDocentes().subscribe({
      next: () => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  guardarDocente(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }

    const docente: Docente = {
      nombreCompleto: this.docenteForm.get('nombreCompleto')?.value,
      ci: this.docenteForm.get('ci')?.value,
      gmail: this.docenteForm.get('gmail')?.value,
      contrasena: this.docenteForm.get('contrasena')?.value,
      esDocente: this.docenteForm.get('esDocente')?.value
    };

    this.docenteService.guardarDocente(docente).subscribe({
      next: () => {
        this.alertsService.toast('Docente guardado con éxito', 'success');
        this.obtenerDocentes();
        this.cerrarModal();
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }


  editarDocente(docente: Docente): void {
    this.isEditMode = true;
    this.modalVisible = true;
    this.docente = docente;
    this.docenteForm.reset({
      nombreCompleto: docente.nombreCompleto,
      gmail: docente.gmail,
      ci: docente.ci,
      contrasena: '',
      esDocente: docente.esDocente ?? true,
    });

    this.docenteForm.get('password')?.clearValidators();
    this.docenteForm.get('password')?.updateValueAndValidity();
  }

 actualizarDocente(): void {
  if (this.docenteForm.invalid) {
    this.docenteForm.markAllAsTouched();
    return;
  }

  const docente: Docente = {
    nombreCompleto: this.docenteForm.get('nombreCompleto')?.value,
    gmail: this.docenteForm.get('gmail')?.value,
    contrasena: this.docenteForm.get('contrasena')?.value,
    ci: this.docente.ci,
    esDocente: this.docenteForm.get('esDocente')?.value
    // No se envía `ci` porque ya lo usas en la URL
  };

  this.docenteService.actualizarDocente(this.docente.ci!, docente).subscribe({
    next: () => {
      this.alertsService.toast('Docente actualizado con éxito', 'success');
      this.obtenerDocentes();
      this.cerrarModal();
    },
    error: (error: any) => {
      this.alertsService.toast(error, 'error');
    },
  });
}


  eliminarDocente(docente: Docente): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.docenteService.eliminarDocente(docente.ci!).subscribe({
          next: () => {
            this.obtenerDocentes();
            this.alertsService.toast('Docente eliminado correctamente', 'success');
            this.page = 1;
          },
          error: (error: any) => {
            this.alertsService.toast(error, 'error');
          },
        });
      }
    });
  }

  onSubmit(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.actualizarDocente();
    } else {
      this.guardarDocente();
    }
  }

  abrirModal(): void {
    this.modalVisible = true;
    this.docenteForm.get('password')?.setValidators([Validators.required]);
    this.docenteForm.get('password')?.updateValueAndValidity();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;

    this.docenteForm.reset({
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      esDocente: true
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.docenteForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.docenteForm, field);
  }
    verDetalle(docente: Docente): void {
    // Navegar a la ruta de detalle del docente
    this.navigationService.setOrigen('docente');
    this.router.navigate(['/dashboard/docente-materia', docente.ci]);
  }
}
