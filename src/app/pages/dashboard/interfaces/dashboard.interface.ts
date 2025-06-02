export interface TarjetaAcceso {
  titulo: string;
  descripcion: string;
  icono: string;
  link: string;
  color: string;
}

export interface MateriaDocente {
  id: number;
  nombre: string;
  curso: {
    id: number;
    nombre: string;
    turno: string;
    nivel?: string;
  };
  totalEstudiantes: number;
  porcentajeAsistencia: number;
  promedioNotas: number;
  estudiantesTopRendimiento: EstudianteResumen[];
  estudiantesBajoRendimiento: EstudianteResumen[];
}

export interface EstudianteResumen {
  id?: number;
  nombre: string;
  ci: string;
  promedio: number;
  porcentajeAsistencia: number;
}

export interface EstadisticasDocente {
  totalEstudiantes: number;
  totalMaterias: number;
  promedioAsistenciaGeneral: number;
  promedioNotasGeneral: number;
  evaluacionesRegistradas: number;
}

export interface AlertaDocente {
  tipo: string;
  estudiante: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
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
