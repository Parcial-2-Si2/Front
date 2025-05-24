// src/app/pages/docente/interfaces/docente-materia.interface.ts
export interface DocenteMateria {
  id?: number;
  fecha: string;
  docente_ci: number;
  materia_id: number;
  materia?: { nombre: string }; // si el backend retorna info expandida
}
