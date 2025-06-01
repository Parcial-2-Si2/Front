// Interfaces para el Dashboard Educativo

export interface Curso {
  id: number;
  nombre: string;
  turno: string;
}

export interface EstudianteRendimiento {
  id: number;
  nombre: string;
  ci: string;
  promedio: number;
  porcentajeAsistencia: number;
}

export interface MateriaDocente {
  id: number;
  nombre: string;
  curso: Curso;
  totalEstudiantes: number;
  porcentajeAsistencia: number;
  promedioNotas: number;
  estudiantesTopRendimiento: EstudianteRendimiento[];
  estudiantesBajoRendimiento: EstudianteRendimiento[];
}

export interface EstadisticasDocente {
  totalEstudiantes: number;
  totalMaterias: number;
  promedioAsistenciaGeneral: number;
  promedioNotasGeneral: number;
  evaluacionesRegistradas: number;
}

export interface AlertaDocente {
  tipo: 'bajo_rendimiento' | 'ausencias_frecuentes' | 'evaluacion_pendiente';
  estudiante: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
}

export interface DashboardDocente {
  materias: MateriaDocente[];
  estadisticas: EstadisticasDocente;
  alertas: AlertaDocente[];
}

export interface EstadisticasGlobales {
  totalDocentes: number;
  totalEstudiantes: number;
  totalMaterias: number;
  totalCursos: number;
  porcentajeAsistenciaInstitucional: number;
  promedioGeneralInstitucional: number;
  evaluacionesRegistradasTotal: number;
}

export interface TarjetaAcceso {
  titulo: string;
  descripcion: string;
  icono: string;
  link: string;
  color: string;
}

export interface DashboardAdmin {
  estadisticasGlobales: EstadisticasGlobales;
  tarjetasAcceso: TarjetaAcceso[];
}