import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { 
  DashboardDocente, 
  DashboardAdmin, 
  TarjetaAcceso, 
  MateriaDocente,
  EstadisticasDocente,
  AlertaDocente,
  EstadisticasGlobales
} from './interfaces/dashboard.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { NavigationService } from '../../../shared/services/navigation.service';

declare const echarts: any;
declare const ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  esDocente: boolean = false;
  ciDocente: string | null = null;
  usuario: any = null; // Para almacenar información completa del usuario
  
  // Datos para docente
  materiasAsignadas: MateriaDocente[] = [];
  estadisticasDocente: EstadisticasDocente | null = null;
  alertasDocente: AlertaDocente[] = [];
  
  // Datos para administrador
  estadisticasAdmin: EstadisticasGlobales | null = null;
  tarjetasAdmin: TarjetaAcceso[] = [];
  
  // Estados de carga
  cargandoDatos = false;

  constructor(
    private dashboardService: DashboardService,
    private alertsService: AlertsService,
    public navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.usuario = this.navigationService.getUsuario();
    this.esDocente = this.navigationService.esDocente();
    this.ciDocente = this.usuario?.ci || null;

    this.inicializarTarjetasAdmin();
    this.cargarDatosDashboard();
  }

  private inicializarTarjetasAdmin(): void {
    this.tarjetasAdmin = [
      {
        titulo: 'Gestiones',
        descripcion: 'Administrar gestiones académicas',
        icono: 'bi bi-calendar-check',
        link: '/dashboard/gestion',
        color: 'primary'
      },
      {
        titulo: 'Docentes',
        descripcion: 'Gestionar información de docentes',
        icono: 'bi bi-person-badge',
        link: '/dashboard/docente',
        color: 'success'
      },
      {
        titulo: 'Estudiantes',
        descripcion: 'Administrar estudiantes',
        icono: 'bi bi-people',
        link: '/dashboard/estudiante',
        color: 'info'
      },
      {
        titulo: 'Materias',
        descripcion: 'Gestionar materias y cursos',
        icono: 'bi bi-journal-bookmark',
        link: '/dashboard/materia',
        color: 'warning'
      },
      {
        titulo: 'Evaluaciones',
        descripcion: 'Ver todas las evaluaciones',
        icono: 'bi bi-clipboard-check',
        link: '/dashboard/evaluacion',
        color: 'secondary'
      },
      {
        titulo: 'Boletines',
        descripcion: 'Generar y consultar boletines',
        icono: 'bi bi-file-earmark-text',
        link: '/dashboard/boletin',
        color: 'dark'
      }
    ];
  }

  private cargarDatosDashboard(): void {
    this.cargandoDatos = true;
    
    if (this.esDocente && this.ciDocente) {
      this.cargarDatosDocente();
    } else {
      this.cargarDatosAdmin();
    }
    
    // Simular carga de datos
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 1000);
  }

  private cargarDatosDocente(): void {
    // Datos de prueba para docente
    this.materiasAsignadas = [
      {
        id: 1,
        nombre: 'Matemáticas',
        curso: {
          id: 1,
          nombre: '1ro A',
          turno: 'Mañana'
        },
        totalEstudiantes: 28,
        porcentajeAsistencia: 87.5,
        promedioNotas: 78.2,
        estudiantesTopRendimiento: [
          { id: 1, nombre: 'Ana García', ci: '12345678', promedio: 92.5, porcentajeAsistencia: 98 },
          { id: 2, nombre: 'Carlos López', ci: '87654321', promedio: 89.3, porcentajeAsistencia: 95 },
          { id: 3, nombre: 'María Silva', ci: '11223344', promedio: 86.7, porcentajeAsistencia: 94 }
        ],
        estudiantesBajoRendimiento: [
          { id: 4, nombre: 'Pedro Rojas', ci: '55667788', promedio: 45.2, porcentajeAsistencia: 65 },
          { id: 5, nombre: 'Luis Torres', ci: '99887766', promedio: 38.9, porcentajeAsistencia: 58 }
        ]
      },
      {
        id: 2,
        nombre: 'Física',
        curso: {
          id: 2,
          nombre: '2do B',
          turno: 'Tarde'
        },
        totalEstudiantes: 25,
        porcentajeAsistencia: 82.3,
        promedioNotas: 74.8,
        estudiantesTopRendimiento: [
          { id: 6, nombre: 'Sofia Mendoza', ci: '22334455', promedio: 88.9, porcentajeAsistencia: 96 },
          { id: 7, nombre: 'Diego Cruz', ci: '66778899', promedio: 85.1, porcentajeAsistencia: 92 }
        ],
        estudiantesBajoRendimiento: [
          { id: 8, nombre: 'Carmen Vega', ci: '33445566', promedio: 42.7, porcentajeAsistencia: 62 }
        ]
      }
    ];

    this.estadisticasDocente = {
      totalEstudiantes: 53,
      totalMaterias: 2,
      promedioAsistenciaGeneral: 84.9,
      promedioNotasGeneral: 76.5,
      evaluacionesRegistradas: 24
    };

    this.alertasDocente = [
      {
        tipo: 'bajo_rendimiento',
        estudiante: 'Pedro Rojas',
        descripcion: 'Promedio por debajo de 51 puntos (45.2)',
        prioridad: 'alta'
      },
      {
        tipo: 'ausencias_frecuentes',
        estudiante: 'Luis Torres',
        descripcion: 'Asistencia del 58% - Por debajo del mínimo',
        prioridad: 'alta'
      },
      {
        tipo: 'bajo_rendimiento',
        estudiante: 'Carmen Vega',
        descripcion: 'Promedio de 42.7 puntos en Física',
        prioridad: 'media'
      }
    ];
  }

  private cargarDatosAdmin(): void {
    // Datos de prueba para administrador
    this.estadisticasAdmin = {
      totalDocentes: 45,
      totalEstudiantes: 1250,
      totalMaterias: 18,
      totalCursos: 24,
      porcentajeAsistenciaInstitucional: 84.2,
      promedioGeneralInstitucional: 73.8,
      evaluacionesRegistradasTotal: 2847
    };
  }

  // Métodos para obtener clases CSS según el rendimiento
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
      case 'bajo_rendimiento': return 'bi bi-graph-down-arrow';
      case 'ausencias_frecuentes': return 'bi bi-calendar-x';
      default: return 'bi bi-exclamation-triangle';
    }
  }
}
