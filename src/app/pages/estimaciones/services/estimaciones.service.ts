import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BoletinCompletoResponse } from '../interfaces/estimaciones.interface';


@Injectable({ providedIn: 'root' })
export class EstimacionesService {

   private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }  obtenerBoletinCompleto(docente_ci: number, materia_id: number, curso_id: number, year?: number): Observable<BoletinCompletoResponse> {
    const params: any = {
      docente_ci: docente_ci.toString(),
      materia_id: materia_id.toString(),
      curso_id: curso_id.toString()
    };
    if (year) params.year = year.toString();

    return this.http.get<BoletinCompletoResponse>(`${this.BASE_URL}Estudiantes/boletin-completo-estudiantes-filtrados`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(err => {
        console.error('[BoletinCompletoService] Error al obtener boletín completo:', err);
        
        // Preservar la información del error HTTP para manejo específico en el componente
        return throwError(() => err);
      })
    );
  }
  // Métodos de búsqueda para autocomplete
  buscarDocentes(termino: string): Observable<any[]> {
    if (!termino || termino.length < 2) return of([]);
    
    return this.http.get<any[]>(`${this.BASE_URL}Docentes/buscar`, {
      headers: this.getHeaders(),
      params: { termino: termino }
    }).pipe(
      map(docentes => {
        if (!docentes || docentes.length === 0) return [];
        return docentes.map(d => ({
          ci: d.ci,
          nombreCompleto: d.nombreCompleto || `${d.nombre} ${d.apellido}`,
          email: d.email || 'Sin email'
        }));
      }),
      catchError(err => {
        console.warn('Error al buscar docentes:', err);
        return of([]);
      })
    );
  }

  buscarMaterias(termino: string): Observable<any[]> {
    if (!termino || termino.length < 2) return of([]);
    
    return this.http.get<any[]>(`${this.BASE_URL}Materias/buscar`, {
      headers: this.getHeaders(),
      params: { termino: termino }
    }).pipe(
      map(materias => {
        if (!materias || materias.length === 0) return [];
        return materias.map(m => ({
          id: m.id,
          nombre: m.nombre,
          descripcion: m.descripcion || 'Sin descripción'
        }));
      }),
      catchError(err => {
        console.warn('Error al buscar materias:', err);
        return of([]);
      })
    );
  }

  buscarCursos(termino: string): Observable<any[]> {
    if (!termino || termino.length < 2) return of([]);
    
    return this.http.get<any[]>(`${this.BASE_URL}Cursos/buscar`, {
      headers: this.getHeaders(),
      params: { termino: termino }
    }).pipe(
      map(cursos => {
        if (!cursos || cursos.length === 0) return [];
        return cursos.map(c => ({
          id: c.id,
          nombre: c.nombre,
          paralelo: c.paralelo || '',
          turno: c.turno || 'Sin turno',
          nivel: c.nivel || 'Sin nivel'
        }));
      }),
      catchError(err => {
        console.warn('Error al buscar cursos:', err);
        return of([]);
      })
    );
  }
}
