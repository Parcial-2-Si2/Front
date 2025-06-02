// Interfaces
export interface BoletinEstudiante {
  ci: number;
  nombreCompleto: string;
  materia: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  periodos: {
    gestion_id: number;
    periodo: string;
    anio: number;
    nota_final: {
      valor: number;
      tiene_nota: boolean;
    };
    nota_estimada: {
      valor: number;
      razon_estimacion: string | null;
      tiene_nota: boolean;
    };
  }[];
  promedios: {
    nota_final: number;
    nota_estimada: number;
  };
  total_periodos: {
    con_nota_final: number;
    con_nota_estimada: number;
  };
}

export interface ResumenBoletin {
  total_estudiantes: number;
  total_periodos_disponibles: number;
  estadisticas_cobertura: {
    estudiantes_con_notas_finales: number;
    estudiantes_con_notas_estimadas: number;
    porcentaje_cobertura_final: number;
    porcentaje_cobertura_estimada: number;
  };
  promedios_generales: {
    nota_final: number;
    nota_estimada: number;
    total_notas_finales_registradas: number;
    total_notas_estimadas_registradas: number;
  };
  materia_info: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  curso_info: {
    id: number;
    nombre: string;
    paralelo: string;
    turno: string;
    nivel: string;
  };
  docente_info: {
    ci: number;
    nombreCompleto: string;
  };
  gestiones: {
    id: number;
    periodo: string;
    anio: number;
  }[];
  year_filtrado: number;
}

export interface BoletinCompletoResponse {
  estudiantes: BoletinEstudiante[];
  resumen: ResumenBoletin;
  mensaje: string;
}