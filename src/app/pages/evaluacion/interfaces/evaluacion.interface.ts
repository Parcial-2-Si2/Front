
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
