import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import {
  EstadisticasDocente,
  EstadisticasGlobales
} from '../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    console.log('Token obtenido:', token);
    
    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // ========== ENDPOINTS PARA ADMINISTRADOR ==========
  
  // Conteo global de docentes y estudiantes usando endpoints existentes
  getConteoGlobal(): Observable<any> {
    console.log('Llamando a getConteoGlobal usando endpoints reales');
    
    // Combinar datos de múltiples endpoints existentes
    return forkJoin({
      docentes: this.http.get(`${this.BASE_URL}Docentes/`, { headers: this.getHeaders() }),
      estudiantes: this.http.get(`${this.BASE_URL}Estudiantes/`, { headers: this.getHeaders() }),
      materias: this.http.get(`${this.BASE_URL}Materias/`, { headers: this.getHeaders() }),
      cursos: this.http.get(`${this.BASE_URL}Curso/`, { headers: this.getHeaders() })
    }).pipe(
      map((data: any) => ({
        total_docentes: Array.isArray(data.docentes) ? data.docentes.length : 0,
        total_estudiantes: Array.isArray(data.estudiantes) ? data.estudiantes.length : 0,
        total_materias: Array.isArray(data.materias) ? data.materias.length : 0,
        total_cursos: Array.isArray(data.cursos) ? data.cursos.length : 0
      })),
      catchError(error => {
        console.error('Error obteniendo conteos globales:', error);
        return of({
          total_docentes: 0,
          total_estudiantes: 0,
          total_materias: 0,
          total_cursos: 0
        });
      })
    );
  }

  // Asistencia global institucional - usar endpoint de evaluaciones si existe
  getAsistenciaGlobal(gestionId?: number): Observable<any> {
    console.log('Llamando a getAsistenciaGlobal');
    
    // Por ahora retornar datos simulados hasta que se confirme el endpoint real
    return of({
      porcentaje_asistencia_institucional: 85.5,
      promedio_general_institucional: 72.3
    });
  }

  // Conteo de evaluaciones usando endpoint existente
  getEvaluacionesContadas(gestionId?: number, anio?: number, periodo?: string): Observable<any> {
    console.log('Llamando a getEvaluacionesContadas');
    
    return this.http.get(`${this.BASE_URL}Evaluacion/`, { headers: this.getHeaders() }).pipe(
      map((evaluaciones: any) => ({
        total_evaluaciones: Array.isArray(evaluaciones) ? evaluaciones.length : 0
      })),
      catchError(error => {
        console.error('Error obteniendo evaluaciones:', error);
        return of({ total_evaluaciones: 0 });
      })
    );
  }

  // ========== ENDPOINTS PARA DOCENTE ==========
  
  // Estudiantes por curso asignado al docente usando endpoints existentes
  getEstudiantesPorCurso(ci: string, year?: number): Observable<any> {
    console.log('Llamando a getEstudiantesPorCurso para CI:', ci);
    
    // Usar endpoint existente de docente-materia para obtener asignaciones
    return this.http.get(`${this.BASE_URL}DocenteMateria/buscar/${ci}`, {
      headers: this.getHeaders()
    }).pipe(
      map((asignaciones: any) => {
        // Simular estructura esperada por el dashboard
        const cursosData = Array.isArray(asignaciones) ? asignaciones.map((asignacion: any) => ({
          id: asignacion.id || 0,
          curso_id: asignacion.curso?.id || 0,
          total_estudiantes: 25, // Valor simulado por ahora
          curso_info: {
            nombre: asignacion.curso?.nombre || 'Curso sin nombre',
            turno: asignacion.curso?.turno || 'Sin turno',
            nivel: asignacion.curso?.nivel || ''
          },
          materias_docente: [{
            id: asignacion.materia?.id || 0,
            nombre: asignacion.materia?.nombre || 'Materia sin nombre'
          }]
        })) : [];

        return {
          cursos: cursosData,
          resumen: {
            total_estudiantes: cursosData.reduce((sum: number, curso: any) => sum + curso.total_estudiantes, 0),
            total_materias: cursosData.length
          }
        };
      }),
      catchError((error: any) => {
        console.error('Error obteniendo datos del docente:', error);
        return of({
          cursos: [],
          resumen: { total_estudiantes: 0, total_materias: 0 }
        });
      })
    );
  }

  // Promedio de asistencia por materia del docente
  getAsistenciaPromedio(ci: string, gestionId?: number): Observable<any> {
    console.log('Llamando a getAsistenciaPromedio para CI:', ci);
    
    // Por ahora retornar datos simulados hasta que se confirme el endpoint real
    return of({
      promedio_asistencia: 82.5,
      materias: [
        { materia_nombre: 'Matemáticas', promedio_asistencia: 85.0 },
        { materia_nombre: 'Física', promedio_asistencia: 80.0 }
      ]
    });
  }

  // Promedio de notas finales por materia del docente
  getNotasPromedio(ci: string, gestionId?: number): Observable<any> {
    console.log('Llamando a getNotasPromedio para CI:', ci);
    
    // Por ahora retornar datos simulados hasta que se confirme el endpoint real
    return of({
      promedio_general: 75.8,
      materias: [
        { materia_nombre: 'Matemáticas', promedio_notas: 78.5 },
        { materia_nombre: 'Física', promedio_notas: 73.1 }
      ]
    });
  }

  // Top 3 mejores y peores estudiantes por materia
  getMejoresPeoresEstudiantes(ci: string, year?: number): Observable<any> {
    console.log('Llamando a getMejoresPeoresEstudiantes para CI:', ci);
    
    // Por ahora retornar datos simulados hasta que se confirme el endpoint real
    return of({
      materias: [
        {
          materia_nombre: 'Matemáticas',
          mejores_estudiantes: [
            { nombre_completo: 'Juan Pérez', ci: '12345678', promedio: 95, porcentaje_asistencia: 98 },
            { nombre_completo: 'María García', ci: '87654321', promedio: 92, porcentaje_asistencia: 95 }
          ],
          peores_estudiantes: [
            { nombre_completo: 'Pedro López', ci: '11111111', promedio: 45, porcentaje_asistencia: 60 }
          ]
        }
      ]
    });
  }

  // ========== MÉTODOS PARA COMBINAR DATOS ==========
  
  // Obtener todas las estadísticas de administrador
  getEstadisticasAdmin(): Observable<any> {
    return this.getConteoGlobal();
  }

  // Obtener todas las estadísticas de docente
  getEstadisticasDocente(ci: string): Observable<any> {
    return this.getEstudiantesPorCurso(ci);
  }
}
