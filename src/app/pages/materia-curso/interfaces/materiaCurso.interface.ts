import { Materia } from '../../materia/interfaces/materia.interfaces';
import { Curso } from '../../curso/interfaces/curso.interface';

export interface MateriaCurso {
  id?: number;
  anio: number;
  materia_id: number;
  curso_id: number;

  materia?: Materia;
  curso?: Curso;
}
