
export interface Evaluacion {
  id?: number;
  descripcion?: string;
  fecha: string; // formato: 'YYYY-MM-DD'
  nota: number;

  tipo_evaluacion_id: number;
  estudiante_ci: number;
  materia_id: number;
  gestion_id: number;
}

// Interfaz extendida para mostrar información relacionada
export interface EvaluacionDetallada extends Evaluacion {
  estudiante_nombre?: string;
  materia_nombre?: string;
  gestion_detalle?: string;
  tipo_evaluacion_nombre?: string;
}
