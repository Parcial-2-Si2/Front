/*export interface MateriaGestion {
  materia_id: number;
  materia_nombre: string;
  nota_final: number;
}

export interface PromedioMateria {
  materia_id: number;
  materia_nombre: string;
  promedio_final: number;
}

export interface BoletinPorGestion {
  materia_id: number;
  materia_nombre: string;
  nota_final: number;
}

export interface BoletinResponse {
  estudiante_ci: number;
  boletin: {
    [gestion: string]: BoletinPorGestion[];
  };
  promedio_por_materia: PromedioMateria[];
}*/

export interface BoletinEstudianteCompletoResponse {
  estudiante: {
    ci: number;
    nombreCompleto: string;
    fechaNacimiento?: string;
    apoderado?: string;
    telefono?: string;
    imagen_url?: string;
  };
  cursos: CursoResumen[];
  materias: MateriaBoletin[];
  resumen_general: ResumenGeneral;
  gestiones_disponibles: GestionResumen[];
  mensaje: string;
}

export interface CursoResumen {
  curso_id: number;
  nombre: string;
  paralelo?: string;
  turno?: string;
  nivel?: string;
  fecha_inscripcion?: string;
}

export interface MateriaBoletin {
  materia_id: number;
  materia_nombre: string;
  materia_descripcion: string;
  periodos: PeriodoNota[];
  promedios: {
    nota_final: number;
    nota_estimada: number;
  };
  totales: {
    periodos_con_nota_final: number;
    periodos_con_nota_estimada: number;
  };
}

export interface PeriodoNota {
  gestion_id: number;
  periodo: string;
  anio: number;
  nota_final: {
    valor: number | null;
    tiene_nota: boolean;
  };
  nota_estimada: {
    valor: number | null;
    razon_estimacion?: string | null;
    tiene_nota: boolean;
  };
}

export interface GestionResumen {
  id: number;
  periodo: string;
  anio: number;
}

export interface ResumenGeneral {
  total_materias: number;
  materias_con_nota_final: number;
  materias_con_nota_estimada: number;
  promedio_general_final: number;
  promedio_general_estimado: number;
  total_periodos_evaluados: number;
  year_evaluado: number;
}
