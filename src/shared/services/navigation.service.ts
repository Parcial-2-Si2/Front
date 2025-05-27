import { Injectable } from '@angular/core';
import { Docente } from '../../app/pages/auth/interfaces/docente.interfaces';
import { Materia } from '../../app/pages/materia/interfaces/materia.interfaces';
import { Curso } from '../../app/pages/curso/interfaces/curso.interface';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private origen: string | null = null;
  private usuarioAutenticado: Docente | null = null;

  private cursoActual: Curso | null = null;
  private materiaActual: Materia | null = null;

  // Origen
  setOrigen(origen: string): void {
    this.origen = origen;
  }

  getOrigen(): string | null {
    return this.origen;
  }

  clearOrigen(): void {
    this.origen = null;
  }

  // Usuario
  setUsuario(usuario: Docente): void {
    this.usuarioAutenticado = usuario;
  }

  getUsuario(): Docente | null {
    return this.usuarioAutenticado;
  }

  getDocenteCI(): string | null {
    return this.usuarioAutenticado?.ci ?? null;
  }

  esDocente(): boolean {
    return !!this.usuarioAutenticado?.esDocente;
  }

  getNombreUsuario(): string {
    return this.usuarioAutenticado?.nombreCompleto ?? '';
  }

  // 📘 Materia actual
  setMateriaActual(materia: Materia): void {
    this.materiaActual = materia;
  }

  getMateriaActual(): Materia | null {
    return this.materiaActual;
  }

  // 📗 Curso actual
  setCursoActual(curso: Curso): void {
    this.cursoActual = curso;
  }

  getCursoActual(): Curso | null {
    return this.cursoActual;
  }
}
