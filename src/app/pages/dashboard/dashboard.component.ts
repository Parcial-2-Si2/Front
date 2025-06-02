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
import{ CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
      { titulo: 'Gestiones', descripcion: 'Administrar gestiones académicas', icono: 'bi bi-calendar-check', link: '/dashboard/gestion', color: 'primary' },
      { titulo: 'Docentes', descripcion: 'Gestionar información de docentes', icono: 'bi bi-person-badge', link: '/dashboard/docentes', color: 'success' },
      { titulo: 'Estudiantes', descripcion: 'Administrar estudiantes', icono: 'bi bi-people', link: '/dashboard/estudiante', color: 'info' },
      { titulo: 'Materias', descripcion: 'Gestionar materias y cursos', icono: 'bi bi-journal-bookmark', link: '/dashboard/materias', color: 'warning' },
      { titulo: 'Evaluaciones', descripcion: 'Ver todas las evaluaciones', icono: 'bi bi-clipboard-check', link: '/dashboard/evaluacion', color: 'secondary' },
      { titulo: 'Boletines', descripcion: 'Generar y consultar boletines', icono: 'bi bi-file-earmark-text', link: '/dashboard/boletines', color: 'dark' }
    ];
  }

  cargarDatosDashboard(): void {
    this.cargandoDatos = true;

    if (this.esDocente && this.ciDocente) {
      this.dashboardService.getEstadisticasDocente(this.ciDocente).subscribe({
        next: res => {
          this.materiasAsignadas = res.cursos.map((curso: any) => ({
            id: 0,
            nombre: curso.materias_docente.map((m: any) => m.nombre).join(', '),
            curso: curso.curso_info,
            totalEstudiantes: curso.total_estudiantes,
            porcentajeAsistencia: 0,
            promedioNotas: 0,
            estudiantesTopRendimiento: [],
            estudiantesBajoRendimiento: []
          }));

          this.estadisticasDocente = {
            totalEstudiantes: res.resumen.total_estudiantes,
            totalMaterias: res.resumen.total_materias_asignadas,
            promedioAsistenciaGeneral: 0,
            promedioNotasGeneral: 0,
            evaluacionesRegistradas: 0
          };
        },
        error: err => {
          this.alertsService.toast('Error al cargar datos del docente', 'error');
        }
      });

      this.dashboardService.getMejoresPeores(this.ciDocente).subscribe({
        next: res => {
          const alertas: AlertaDocente[] = [];
          const materias = Object.values(res.materias_con_estudiantes);

          materias.forEach((m: any) => {
            m.peores_estudiantes?.forEach((e: any) => {
              alertas.push({
                tipo: 'bajo_rendimiento',
                estudiante: e.nombre_completo,
                descripcion: `Promedio: ${e.nota_final}`,
                prioridad: e.nota_final < 51 ? 'alta' : 'media'
              });
            });
          });

          this.alertasDocente = alertas;
        }
      });

    } else {
      const params: any = this.anioBusqueda ? { gestion_id: this.anioBusqueda } : {};

      this.dashboardService.getEstadisticasAdmin().subscribe({
        next: res => {
          this.estadisticasAdmin = {
            totalDocentes: res.total_docentes,
            totalEstudiantes: res.total_estudiantes,
            totalMaterias: 0,
            totalCursos: 0,
            porcentajeAsistenciaInstitucional: 0,
            promedioGeneralInstitucional: 0,
            evaluacionesRegistradasTotal: 0,
            ...res
          };
        },
        error: err => {
          this.alertsService.toast('Error al cargar estadísticas del administrador', 'error');
        }
      });

      this.dashboardService.getEvaluacionesContadas(this.anioBusqueda || undefined).subscribe({
        next: res => {
          this.estadisticasAdmin = {
            ...this.estadisticasAdmin!,
            totalMaterias: res.resumen_general?.total_materias_evaluadas || 0,
            totalCursos: res.resumen_general?.total_cursos || 0,
            evaluacionesRegistradasTotal: res.resumen_general?.total_evaluaciones || 0
          };
        }
      });
    }

    setTimeout(() => this.cargandoDatos = false, 1000);
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
      case 'bajo_rendimiento': return 'bi bi-graph-down-arrow';
      case 'ausencias_frecuentes': return 'bi bi-calendar-x';
      default: return 'bi bi-exclamation-triangle';
    }
  }
}
