export interface DocenteMateria {
  id?: number;
  fecha: string; // en formato ISO yyyy-MM-dd
  docente_ci: number;
  materia_id: number;

  // opcionalmente, puedes incluir estos si el backend también devuelve los objetos anidados:
  docente?: {
    ci: number;
    nombreCompleto?: string;
    gmail?: string;
    telefono?: string;
    imagen_url?: string;
  };

  materia?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}
