import { Component, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import {
  AlertaDocente,
  EstadisticasDocente,
  EstadisticasGlobales,
  MateriaDocente,
  TarjetaAcceso
} from './interfaces/dashboard.interface';
import { NavigationService } from '../../../shared/services/navigation.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { AuthService } from '../auth/services/auth.service';
import{ CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  esDocente: boolean = false;
  ciDocente: string | null = null;
  usuario: any = null;
  anioBusqueda: number | null = null;

  materiasAsignadas: MateriaDocente[] = [];
  estadisticasDocente: EstadisticasDocente | null = null;
  alertasDocente: AlertaDocente[] = [];

  estadisticasAdmin: EstadisticasGlobales | null = null;
  tarjetasAdmin: TarjetaAcceso[] = [];
  cargandoDatos = false;
  constructor(
    private dashboardService: DashboardService,
    private alertsService: AlertsService,
    private authService: AuthService,
    public navigationService: NavigationService
  ) {}  ngOnInit(): void {    
    // *** DATOS DE PRUEBA TEMPORALES ***
    // Simular un token y usuario para pruebas cuando no hay usuario autenticado
    if (!localStorage.getItem('auth_token')) {
      console.log('Agregando datos de prueba temporales...');
      
      // Para probar como DOCENTE, cambiar esDocente a true y proporcionar un CI real
      const usuarioPrueba = {
        ci: '12345678', // CI del docente para pruebas (cambia por uno real del backend)
        nombreCompleto: 'Docente de Prueba',
        esDocente: true, // Cambiar a false para probar vista de administrador
        gmail: 'docente@test.com'
      };
      
      localStorage.setItem('auth_token', 'fake-token-for-testing');
      localStorage.setItem('auth_user', JSON.stringify(usuarioPrueba));
      
      console.log('Usuario de prueba configurado:', usuarioPrueba);
    }
    // *** FIN DATOS DE PRUEBA ***

    this.usuario = this.authService.getCurrentUser();
    this.esDocente = this.usuario?.esDocente || false;
    this.ciDocente = this.usuario?.ci || null;
    
    console.log('Dashboard inicializado:');
    console.log('- Usuario:', this.usuario);
    console.log('- Es docente:', this.esDocente);
    console.log('- CI Docente:', this.ciDocente);
    console.log('- Token en localStorage:', localStorage.getItem('auth_token'));
    console.log('- Base URL del backend:', 'http://127.0.0.1:5000/');

    this.inicializarTarjetasAdmin();
    this.cargarDatosDashboard();
  }

  private inicializarTarjetasAdmin(): void {
    this.tarjetasAdmin = [
      { titulo: 'Gestiones', descripcion: 'Administrar gestiones académicas', icono: 'bi bi-calendar-check', link: '/dashboard/gestion', color: 'primary' },
      { titulo: 'Docentes', descripcion: 'Gestionar información de docentes', icono: 'bi bi-person-badge', link: '/dashboard/docentes', color: 'success' },
      { titulo: 'Estudiantes', descripcion: 'Administrar estudiantes', icono: 'bi bi-people', link: '/dashboard/estudiante', color: 'info' },
      { titulo: 'Materias', descripcion: 'Gestionar materias y cursos', icono: 'bi bi-journal-bookmark', link: '/dashboard/materias', color: 'warning' },
      { titulo: 'Evaluaciones', descripcion: 'Ver todas las evaluaciones', icono: 'bi bi-clipboard-check', link: '/dashboard/evaluacion', color: 'secondary' },
      { titulo: 'Boletines', descripcion: 'Generar y consultar boletines', icono: 'bi bi-file-earmark-text', link: '/dashboard/boletines', color: 'dark' }
    ];
  }  cargarDatosDashboard(): void {
    this.cargandoDatos = true;

    if (this.esDocente && this.ciDocente) {
      console.log('Cargando datos para docente:', this.ciDocente);
      this.cargarDatosDocente();
    } else {
      console.log('Cargando datos para administrador');
      this.cargarDatosAdmin();
    }
  }
  private cargarDatosDocente(): void {
    const ci = this.ciDocente!;
    console.log('=== INICIANDO CARGA DE DATOS DEL DOCENTE ===');
    console.log('CI del docente:', ci);
    
    // Cargar datos en paralelo usando forkJoin
    forkJoin({
      estudiantes: this.dashboardService.getEstudiantesPorCurso(ci),
      asistencia: this.dashboardService.getAsistenciaPromedio(ci),
      notas: this.dashboardService.getNotasPromedio(ci),
      mejoresPeores: this.dashboardService.getMejoresPeoresEstudiantes(ci)
    }).pipe(
      catchError(error => {
        console.error('Error cargando datos del docente:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        
        this.alertsService.alertError(`Error al cargar datos del docente: ${error.status} - ${error.statusText || error.message}`);
        return of({
          estudiantes: { cursos: [], resumen: { total_estudiantes: 0, total_materias: 0 } },
          asistencia: { promedio_asistencia: 0, materias: [] },
          notas: { promedio_general: 0, materias: [] },
          mejoresPeores: { materias: [] }
        });
      })
    ).subscribe({
      next: (data) => {
        console.log('=== DATOS DEL DOCENTE RECIBIDOS ===');
        console.log('Estudiantes:', data.estudiantes);
        console.log('Asistencia:', data.asistencia);
        console.log('Notas:', data.notas);
        console.log('Mejores/Peores:', data.mejoresPeores);
        
        this.procesarDatosDocente(data);
        this.cargandoDatos = false;
      },
      error: (error) => {
        console.error('Error en forkJoin:', error);
        this.alertsService.alertError('Error crítico al cargar datos del docente');
        this.cargandoDatos = false;
      }
    });
  }
  private cargarDatosAdmin(): void {
    console.log('=== INICIANDO CARGA DE DATOS DEL ADMINISTRADOR ===');
    
    // Cargar datos administrativos en paralelo
    forkJoin({
      conteos: this.dashboardService.getConteoGlobal(),
      asistencia: this.dashboardService.getAsistenciaGlobal(),
      evaluaciones: this.dashboardService.getEvaluacionesContadas()
    }).pipe(
      catchError(error => {
        console.error('Error cargando datos del administrador:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        
        this.alertsService.alertError(`Error al cargar datos administrativos: ${error.status} - ${error.statusText || error.message}`);
        return of({
          conteos: { total_docentes: 0, total_estudiantes: 0 },
          asistencia: { porcentaje_asistencia_institucional: 0 },
          evaluaciones: { total_evaluaciones: 0 }
        });
      })
    ).subscribe({
      next: (data) => {
        console.log('=== DATOS DEL ADMINISTRADOR RECIBIDOS ===');
        console.log('Conteos:', data.conteos);
        console.log('Asistencia:', data.asistencia);
        console.log('Evaluaciones:', data.evaluaciones);
        
        this.procesarDatosAdmin(data);
        this.cargandoDatos = false;
      },
      error: (error) => {
        console.error('Error en forkJoin admin:', error);
        this.alertsService.alertError('Error crítico al cargar datos administrativos');
        this.cargandoDatos = false;
      }
    });
  }

  private procesarDatosDocente(data: any): void {
    // Procesar datos de estudiantes por curso
    this.materiasAsignadas = data.estudiantes.cursos?.map((curso: any) => ({
      id: curso.id || 0,
      nombre: curso.materias_docente?.map((m: any) => m.nombre).join(', ') || 'Sin materias',
      curso: {
        id: curso.curso_id || 0,
        nombre: curso.curso_info?.nombre || 'Curso sin nombre',
        turno: curso.curso_info?.turno || 'Sin turno',
        nivel: curso.curso_info?.nivel || ''
      },
      totalEstudiantes: curso.total_estudiantes || 0,
      porcentajeAsistencia: 0, // Se actualizará con datos de asistencia
      promedioNotas: 0, // Se actualizará con datos de notas
      estudiantesTopRendimiento: [],
      estudiantesBajoRendimiento: []
    })) || [];

    // Mapear datos de asistencia a las materias
    if (data.asistencia.materias) {
      data.asistencia.materias.forEach((materia: any) => {
        const materiaEncontrada = this.materiasAsignadas.find(m => 
          m.nombre.includes(materia.materia_nombre)
        );
        if (materiaEncontrada) {
          materiaEncontrada.porcentajeAsistencia = materia.promedio_asistencia || 0;
        }
      });
    }

    // Mapear datos de notas a las materias
    if (data.notas.materias) {
      data.notas.materias.forEach((materia: any) => {
        const materiaEncontrada = this.materiasAsignadas.find(m => 
          m.nombre.includes(materia.materia_nombre)
        );
        if (materiaEncontrada) {
          materiaEncontrada.promedioNotas = materia.promedio_notas || 0;
        }
      });
    }

    // Mapear mejores y peores estudiantes
    if (data.mejoresPeores.materias) {
      data.mejoresPeores.materias.forEach((materia: any) => {
        const materiaEncontrada = this.materiasAsignadas.find(m => 
          m.nombre.includes(materia.materia_nombre)
        );
        if (materiaEncontrada) {
          materiaEncontrada.estudiantesTopRendimiento = materia.mejores_estudiantes?.map((est: any) => ({
            nombre: est.nombre_completo || est.nombre || 'Sin nombre',
            ci: est.ci || 'Sin CI',
            promedio: est.promedio || 0,
            porcentajeAsistencia: est.porcentaje_asistencia || 0
          })) || [];
          
          materiaEncontrada.estudiantesBajoRendimiento = materia.peores_estudiantes?.map((est: any) => ({
            nombre: est.nombre_completo || est.nombre || 'Sin nombre',
            ci: est.ci || 'Sin CI',
            promedio: est.promedio || 0,
            porcentajeAsistencia: est.porcentaje_asistencia || 0
          })) || [];
        }
      });
    }

    // Establecer estadísticas generales del docente
    this.estadisticasDocente = {
      totalEstudiantes: data.estudiantes.resumen?.total_estudiantes || 0,
      totalMaterias: data.estudiantes.resumen?.total_materias || 0,
      promedioAsistenciaGeneral: data.asistencia.promedio_asistencia || 0,
      promedioNotasGeneral: data.notas.promedio_general || 0,
      evaluacionesRegistradas: data.evaluaciones?.total_evaluaciones || 0
    };

    // Generar alertas basadas en los datos
    this.generarAlertasDocente();
  }

  private procesarDatosAdmin(data: any): void {
    this.estadisticasAdmin = {
      totalDocentes: data.conteos.total_docentes || 0,
      totalEstudiantes: data.conteos.total_estudiantes || 0,
      totalMaterias: data.conteos.total_materias || 0,
      totalCursos: data.conteos.total_cursos || 0,
      porcentajeAsistenciaInstitucional: data.asistencia.porcentaje_asistencia_institucional || 0,
      promedioGeneralInstitucional: data.asistencia.promedio_general_institucional || 0,
      evaluacionesRegistradasTotal: data.evaluaciones.total_evaluaciones || 0
    };
  }

  private generarAlertasDocente(): void {
    this.alertasDocente = [];

    this.materiasAsignadas.forEach(materia => {
      // Alerta por baja asistencia
      if (materia.porcentajeAsistencia < 70) {
        this.alertasDocente.push({
          tipo: 'Asistencia Baja',
          estudiante: materia.nombre,
          descripcion: `Asistencia del ${materia.porcentajeAsistencia.toFixed(1)}% en ${materia.curso.nombre}`,
          prioridad: 'alta'
        });
      }

      // Alerta por bajo rendimiento
      if (materia.promedioNotas < 60) {
        this.alertasDocente.push({
          tipo: 'Bajo Rendimiento',
          estudiante: materia.nombre,
          descripcion: `Promedio de ${materia.promedioNotas.toFixed(1)} en ${materia.curso.nombre}`,
          prioridad: 'alta'
        });
      }

      // Alertas por estudiantes individuales con problemas
      materia.estudiantesBajoRendimiento.forEach(estudiante => {
        if (estudiante.promedio < 51) {
          this.alertasDocente.push({
            tipo: 'Estudiante en Riesgo',
            estudiante: estudiante.nombre,
            descripcion: `Promedio de ${estudiante.promedio} en ${materia.nombre}`,
            prioridad: 'alta'
          });
        }      });
    });
  }

  ejecutarBusqueda(): void {
    this.cargarDatosDashboard();
  }

  getClaseRendimiento(promedio: number): string {
    if (promedio >= 85) return 'badge bg-success';
    if (promedio >= 70) return 'badge bg-warning';
    if (promedio >= 51) return 'badge bg-info';
    return 'badge bg-danger';
  }

  getClaseAsistencia(porcentaje: number): string {
    if (porcentaje >= 90) return 'text-success';
    if (porcentaje >= 80) return 'text-warning';
    return 'text-danger';
  }

  getClaseAlerta(prioridad: string): string {
    switch (prioridad) {
      case 'alta': return 'alert alert-danger';
      case 'media': return 'alert alert-warning';
      default: return 'alert alert-info';
    }
  }

  getIconoAlerta(tipo: string): string {
    switch (tipo) {
      case 'Bajo Rendimiento': return 'bi bi-graph-down-arrow';
      case 'Asistencia Baja': return 'bi bi-calendar-x';
      case 'Estudiante en Riesgo': return 'bi bi-exclamation-triangle';
      default: return 'bi bi-info-circle';
    }
  }
}
