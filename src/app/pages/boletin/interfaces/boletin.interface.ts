export interface BoletinEstudiante {
  estudiante_ci: number;
  estudiante_nombre: string;
  materias: MateriaBoletin[];
}

export interface MateriaBoletin {
  materia_id: number;
  materia_nombre: string;
  primer_trimestre?: number;
  segundo_trimestre?: number;
  tercer_trimestre?: number;
  nota_final?: number;
}

// Nueva interfaz que coincide con la respuesta real del backend
export interface BoletinBackendResponse {
  estudiante_ci: number;
  boletin: { [gestion: string]: MateriaGestion[] };
  promedio_por_materia: PromedioMateria[];
}

export interface MateriaGestion {
  materia_id: number;
  materia_nombre: string;
  nota_final: number;
}

export interface PromedioMateria {
  materia_id: number;
  materia_nombre: string;
  promedio_final: number;
}

// Interfaz adaptada para el frontend (mantenemos compatibilidad)
export interface BoletinResponse {
  estudiante_ci: number;
  estudiante_nombre: string;
  gestion_anio: number;
  gestion_periodo: string;
  materias: MateriaBoletin[];
}
