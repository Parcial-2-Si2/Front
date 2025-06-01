import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Estudiante } from '../estudiante/interfaces/estudiante.interface';
import { FiltroEstudiantesService } from './services/filtro-estudiantes.service';
import { Curso } from '../curso/interfaces/curso.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { Docente } from '../auth/interfaces/docente.interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Gestion } from '../gestion/interfaces/gestion.interface';
import { TipoEvaluacion } from '../tipo-evaluacion/interfaces/tipoEvaluacion.interface';
import { GestionService } from '../gestion/services/gestion.service';
import { TipoEvaluacionService } from '../tipo-evaluacion/services/tipo-evaluacion.service';
import { EvaluacionService } from '../evaluacion/services/evaluacion.service';
import { Evaluacion } from '../evaluacion/interfaces/evaluacion.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-filtro-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './filtro-estudiantes.component.html',
  styleUrls: ['./filtro-estudiantes.component.css']
})
export class FiltroEstudiantesComponent implements OnInit {
  estudiantesFiltrados: (Estudiante & {
    asistio?: boolean;
    falta?: boolean;
    licencia?: boolean;
    retraso?: boolean;
    nota?: number;
    justificacion?: string;
  })[] = [];

  docente_ci!: number;
  materia_id!: number;
  curso_id!: number;
  fechaHoy: string = new Date().toISOString().split('T')[0];

  docenteSeleccionado!: Docente;
  materiaSeleccionada!: Materia;
  cursoSeleccionado!: Curso;

  gestiones: Gestion[] = [];
  tiposEvaluacion: TipoEvaluacion[] = [];
  gestionSeleccionada!: Gestion | null;
  tipoEvaluacionSeleccionada: TipoEvaluacion | null = null;
  gestion_id!: number;
  tipo_evaluacion_id!: number;
  // Propiedades para el manejo dinámico de la tabla
  esAsistenciaDiaria: boolean = true;
  descripcionEvaluacion: string = '';
  
  // Para debug: tracking del estado anterior
  private estadoAnterior = {
    descripcionEvaluacion: '',
    gestion_id: 0,
    tipo_evaluacion_id: 0,
    fechaHoy: ''
  };
  
  modalVisible: boolean = false;
  estudianteSeleccionado: any = null;

  // Paginación
  page: number = 1;
  limit: number = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public navigationService: NavigationService,
    private filtroService: FiltroEstudiantesService,
    private gestionService: GestionService,
    private tipoEvaluacionService: TipoEvaluacionService,
    private evaluacionService: EvaluacionService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.docente_ci = Number(params['docente_ci']);
      this.materia_id = Number(params['materia_id']);
      this.curso_id = Number(params['curso_id']);

      this.docenteSeleccionado = this.navigationService.getUsuario() ?? { nombreCompleto: 'Desconocido' } as Docente;
      this.materiaSeleccionada = this.navigationService.getMateriaActual() ?? { nombre: 'Desconocido' } as Materia;
      this.cursoSeleccionado = this.navigationService.getCursoActual() ?? { nombre: 'Desconocido', descripcion: '' } as Curso;

      this.cargarGestiones();
      this.cargarTiposEvaluacion();
      this.cargarEstudiantes();
    });
  }

  cargarEstudiantes(): void {
    this.filtroService.filtrarEstudiantes(this.docente_ci, this.materia_id, this.curso_id).subscribe({
      next: (estudiantes) => {
        this.estudiantesFiltrados = estudiantes.map(e => ({
          ...e,
          asistio: false,
          falta: false,
          licencia: false,
          retraso: false,
          nota: 0,
          justificacion: ''
        }));
      },
      error: () => this.alertsService.toast('Error al cargar estudiantes', 'error')
    });
  }

  cargarGestiones(): void {
    this.gestionService.obtenerGestiones().subscribe({
      next: (gestiones) => this.gestiones = gestiones,
      error: () => this.alertsService.toast('Error al cargar gestiones', 'error')
    });
  }

  cargarTiposEvaluacion(): void {
    this.tipoEvaluacionService.obtenerTiposEvaluacion().subscribe({
      next: (tipos) => {
        this.tiposEvaluacion = tipos;
        // Establecer "Asistencia Diaria" como default si existe
        const asistenciaDiaria = tipos.find(t => t.id === 1);
        if (asistenciaDiaria) {
          this.tipoEvaluacionSeleccionada = asistenciaDiaria;
          this.tipo_evaluacion_id = 1;
          this.esAsistenciaDiaria = true;
        }
      },
      error: () => this.alertsService.toast('Error al cargar tipos de evaluación', 'error')
    });
  }  onGestionSeleccionada(gestion: Gestion | null): void {
    console.log('=== onGestionSeleccionada ===');
    console.log('Gestión seleccionada:', gestion);
    console.log('gestion_id ACTUAL:', this.gestion_id);
    if (gestion?.id != null) {
      const gestionAnterior = this.gestion_id;
      this.gestion_id = gestion.id;
      console.log('gestion_id establecido a:', this.gestion_id);
      if (gestionAnterior !== this.gestion_id) {
        console.log('GESTIÓN CAMBIÓ');
      } else {
        console.log('GESTIÓN NO CAMBIÓ');
      }
    } else {
      console.log('Gestión inválida o null');
      this.gestion_id = 0; // Reset to invalid value
    }
  }  onTipoEvaluacionSeleccionada(tipo: TipoEvaluacion | null): void {
    console.log('=== onTipoEvaluacionSeleccionada ===');
    console.log('Tipo evaluación seleccionado:', tipo);
    console.log('tipo_evaluacion_id ACTUAL:', this.tipo_evaluacion_id);
    console.log('descripcionEvaluacion ANTES del cambio:', this.descripcionEvaluacion);
    
    if (tipo?.id != null) {
      // Solo limpiar datos si realmente cambió el tipo de evaluación
      const tipoAnterior = this.tipo_evaluacion_id;
      const esAsistenciaAnterior = this.esAsistenciaDiaria;
      
      this.tipo_evaluacion_id = tipo.id;
      this.esAsistenciaDiaria = tipo.id === 1;
      
      console.log('tipo_evaluacion_id establecido a:', this.tipo_evaluacion_id);
      console.log('esAsistenciaDiaria establecido a:', this.esAsistenciaDiaria);
      
      // Solo limpiar si cambió el tipo de evaluación Y si no es undefined/NaN el anterior
      if (tipoAnterior && tipoAnterior !== this.tipo_evaluacion_id) {
        console.log('TIPO CAMBIÓ - Limpiando datos');
        this.limpiarDatosEstudiantes();
        // Solo resetear descripción si cambiamos de un tipo no-asistencia a asistencia o viceversa
        if (esAsistenciaAnterior !== this.esAsistenciaDiaria) {
          this.descripcionEvaluacion = '';
          console.log('RESETEO descripcionEvaluacion por cambio de modo');
        }
      } else {
        console.log('TIPO NO CAMBIÓ O ES PRIMERA VEZ - Manteniendo datos');
      }
      
      console.log('descripcionEvaluacion DESPUÉS:', this.descripcionEvaluacion);
    } else {
      console.log('Tipo de evaluación inválido o null');
      this.tipo_evaluacion_id = 0; // Reset to invalid value
      this.esAsistenciaDiaria = true; // Default
    }
  }

  limpiarDatosEstudiantes(): void {
    this.estudiantesFiltrados.forEach(estudiante => {
      estudiante.asistio = false;
      estudiante.falta = false;
      estudiante.licencia = false;
      estudiante.retraso = false;
      estudiante.nota = 0;
    });
  }

  // Validar que solo un checkbox esté seleccionado para asistencia
  onAsistenciaChange(estudiante: any, tipo: 'asistio' | 'falta' | 'licencia' | 'retraso'): void {
    if (estudiante[tipo]) {
      // Desmarcar los otros checkboxes
      const tipos = ['asistio', 'falta', 'licencia', 'retraso'];
      tipos.forEach(t => {
        if (t !== tipo) {
          estudiante[t] = false;
        }
      });
    }
  }

  abrirJustificacionModal(estudiante: any): void {
    this.estudianteSeleccionado = estudiante;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.estudianteSeleccionado = null;
  }

  guardarJustificacion(): void {
    this.cerrarModal();
  }
  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.estudiantesFiltrados = searchTerm
      ? this.estudiantesFiltrados.filter((estudiante) =>
          estudiante.nombreCompleto.toLowerCase().includes(searchTerm) ||
          estudiante.ci.toString().includes(searchTerm)
        )
      : [...this.estudiantesFiltrados];
    this.page = 1;
  }

  guardarEvaluaciones(): void {
    // Validaciones
    if (!this.gestion_id) {
      this.alertsService.toast('Debe seleccionar una gestión', 'warning');
      return;
    }

    if (!this.tipo_evaluacion_id) {
      this.alertsService.toast('Debe seleccionar un tipo de evaluación', 'warning');
      return;
    }

    if (!this.esAsistenciaDiaria && !this.descripcionEvaluacion.trim()) {
      this.alertsService.toast('Debe ingresar una descripción para la evaluación', 'warning');
      return;
    }

    const fechaActual = this.fechaHoy;
    let evaluacionesGuardadas = 0;
    let totalEvaluaciones = this.estudiantesFiltrados.length;

    this.estudiantesFiltrados.forEach(estudiante => {
      let descripcion = '';
      let nota = 0;

      if (this.esAsistenciaDiaria) {
        // Lógica para asistencia diaria
        if (estudiante.asistio) {
          descripcion = 'Asistió';
          nota = 10;
        } else if (estudiante.licencia) {
          descripcion = 'Licencia';
          nota = 10;
        } else if (estudiante.falta) {
          descripcion = 'Falta';
          nota = 0;
        } else if (estudiante.retraso) {
          descripcion = 'Retraso';
          nota = 5;
        } else {
          descripcion = 'Sin registrar';
          nota = 0;
        }
      } else {
        // Lógica para otras evaluaciones
        descripcion = this.descripcionEvaluacion;
        nota = estudiante.nota || 0;
      }

      const evaluacion: Evaluacion = {
        descripcion: descripcion,
        fecha: fechaActual,
        nota: nota,
        estudiante_ci: estudiante.ci,
        materia_id: this.materia_id,
        gestion_id: this.gestion_id,
        tipo_evaluacion_id: this.tipo_evaluacion_id
      };

      this.evaluacionService.guardarAsistencia(evaluacion).subscribe({
        next: () => {
          evaluacionesGuardadas++;
          if (evaluacionesGuardadas === totalEvaluaciones) {
            this.alertsService.toast('Evaluaciones registradas correctamente', 'success');
          }
        },
        error: () => {
          this.alertsService.toast(`Error al guardar evaluación de ${estudiante.nombreCompleto}`, 'error');
        }
      });
    });
  }

  editarEvaluacion(evaluacionId?: number): void {
    // Implementar lógica de edición
    this.alertsService.toast('Función de edición en desarrollo', 'info');
  }

  volver(): void {
    this.router.navigate(['/dashboard/curso']);
  }

  // Método para validar notas (0-100)
  validarNota(estudiante: any): void {
    if (estudiante.nota < 0) {
      estudiante.nota = 0;
    } else if (estudiante.nota > 100) {
      estudiante.nota = 100;
    }
  }

  // TrackBy function para mejorar el rendimiento de ngFor
  trackByCI(index: number, estudiante: any): any {
    return estudiante.ci;
  }  guardarEvaluacionIndividual(estudiante: any): void {
    console.log('=== INICIO guardarEvaluacionIndividual ===');
    console.log('Estudiante:', estudiante.nombreCompleto);
    
    // Capturar estado ANTES de cualquier operación
    this.capturarEstadoAnterior();
    
    console.log('gestion_id:', this.gestion_id);
    console.log('tipo_evaluacion_id:', this.tipo_evaluacion_id);
    console.log('descripcionEvaluacion:', this.descripcionEvaluacion);
    console.log('fechaHoy:', this.fechaHoy);
    console.log('esAsistenciaDiaria:', this.esAsistenciaDiaria);

    if (!this.gestion_id || !this.tipo_evaluacion_id) {
      this.alertsService.toast('Debe seleccionar una gestión y tipo de evaluación', 'warning');
      return;
    }

    const fechaActual = this.fechaHoy;
    let descripcion = '';
    let nota = 0;

    if (this.esAsistenciaDiaria) {
      if (estudiante.asistio) {
        descripcion = 'Asistió';
        nota = 10;
      } else if (estudiante.licencia) {
        descripcion = 'Licencia';
        nota = 10;
      } else if (estudiante.falta) {
        descripcion = 'Falta';
        nota = 0;
      } else if (estudiante.retraso) {
        descripcion = 'Retraso';
        nota = 5;
      } else {
        descripcion = 'Sin registrar';
        nota = 0;
      }
    } else {
      descripcion = this.descripcionEvaluacion;
      nota = estudiante.nota ?? 0;
    }

    console.log('Descripcion calculada:', descripcion);
    console.log('Nota calculada:', nota);

    const evaluacion: Evaluacion = {
      descripcion: descripcion,
      fecha: fechaActual,
      nota: nota,
      estudiante_ci: estudiante.ci,
      materia_id: this.materia_id,
      gestion_id: this.gestion_id,
      tipo_evaluacion_id: this.tipo_evaluacion_id
    };

    console.log('Objeto evaluacion a enviar:', evaluacion);

    const request$ = this.tipo_evaluacion_id === 1
      ? this.evaluacionService.guardarAsistencia(evaluacion)
      : this.evaluacionService.guardarEvaluacion(evaluacion);

    request$.subscribe({
      next: () => {
        console.log('Evaluación guardada exitosamente');
        console.log('Estado después del guardado:');
        console.log('- gestion_id:', this.gestion_id);
        console.log('- tipo_evaluacion_id:', this.tipo_evaluacion_id);
        console.log('- descripcionEvaluacion:', this.descripcionEvaluacion);
        console.log('- fechaHoy:', this.fechaHoy);
        
        // Verificar si algo cambió después del guardado
        this.verificarCambiosPostGuardado();
        
        this.alertsService.toast(`Evaluación guardada para ${estudiante.nombreCompleto}`, 'success');
      },
      error: (err) => {
        console.log('Error al guardar evaluación:', err);
        if (err.status === 500) {
          // Mensaje de advertencia cuando ocurre el 500 pero los datos posiblemente se guardaron
          this.alertsService.toast(`Error 500 pero posiblemente se guardó la evaluación de ${estudiante.nombreCompleto}`, 'warning');
        } else {
          this.alertsService.toast(`Error al guardar evaluación para ${estudiante.nombreCompleto}`, 'error');
        }
      }
    });

    console.log('=== FIN guardarEvaluacionIndividual ===');
  }
  // Método para trackear cambios en la descripción
  onDescripcionChange(event: any): void {
    console.log('=== onDescripcionChange ===');
    console.log('Nueva descripción:', event.target.value);
    console.log('descripcionEvaluacion actual:', this.descripcionEvaluacion);
  }

  // Método para capturar el estado antes de operaciones críticas
  private capturarEstadoAnterior(): void {
    this.estadoAnterior = {
      descripcionEvaluacion: this.descripcionEvaluacion,
      gestion_id: this.gestion_id,
      tipo_evaluacion_id: this.tipo_evaluacion_id,
      fechaHoy: this.fechaHoy
    };
    console.log('Estado anterior capturado:', this.estadoAnterior);
  }

  // Método para verificar cambios después del guardado
  private verificarCambiosPostGuardado(): void {
    const cambios: string[] = [];
    
    if (this.estadoAnterior.descripcionEvaluacion !== this.descripcionEvaluacion) {
      cambios.push(`descripcionEvaluacion: "${this.estadoAnterior.descripcionEvaluacion}" -> "${this.descripcionEvaluacion}"`);
    }
    if (this.estadoAnterior.gestion_id !== this.gestion_id) {
      cambios.push(`gestion_id: ${this.estadoAnterior.gestion_id} -> ${this.gestion_id}`);
    }
    if (this.estadoAnterior.tipo_evaluacion_id !== this.tipo_evaluacion_id) {
      cambios.push(`tipo_evaluacion_id: ${this.estadoAnterior.tipo_evaluacion_id} -> ${this.tipo_evaluacion_id}`);
    }
    if (this.estadoAnterior.fechaHoy !== this.fechaHoy) {
      cambios.push(`fechaHoy: "${this.estadoAnterior.fechaHoy}" -> "${this.fechaHoy}"`);
    }
    
    if (cambios.length > 0) {
      console.warn('⚠️ SE DETECTARON CAMBIOS DESPUÉS DEL GUARDADO:');
      cambios.forEach(cambio => console.warn(`  - ${cambio}`));
    } else {
      console.log('✅ No se detectaron cambios después del guardado');
    }
  }

}