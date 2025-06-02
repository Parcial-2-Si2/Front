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
}
