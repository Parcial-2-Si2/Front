import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroment';
import { Observable, Subject, map, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Estudiante } from '../interfaces/estudiante.interface';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _estudiantesSubject = new Subject<Estudiante[]>();
  public estudiantes$ = this._estudiantesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders().set('Authorization', token);
  }

  obtenerEstudiantes(): Observable<Estudiante[]> {
    const url = `${this.BASE_URL}Estudiantes/`;
    return this.http.get<Estudiante[]>(url, { headers: this.getHeaders() }).pipe(
      map(estudiantes => estudiantes.sort((a, b) => a.ci! - b.ci!)),
      tap(estudiantes => this._estudiantesSubject.next(estudiantes)),
      catchError(() => throwError(() => 'Error al obtener los estudiantes'))
    );
  }

  guardarEstudiante(estudiante: FormData): Observable<Estudiante> {
    const url = `${this.BASE_URL}Estudiantes/`;
    return this.http.post<Estudiante>(url, estudiante, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al guardar el estudiante'))
    );
  }

  actualizarEstudiante(ci: number, estudiante: Estudiante): Observable<Estudiante> {
    const url = `${this.BASE_URL}Estudiantes/${ci}`;
    return this.http.put<Estudiante>(url, estudiante, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al actualizar estudiante'))
    );
  }

  eliminarEstudiante(ci: number): Observable<any> {
    const url = `${this.BASE_URL}Estudiantes/${ci}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al eliminar estudiante'))
    );
  }

  buscarPorNombre(nombre: string): Observable<Estudiante[]> {
    const url = `${this.BASE_URL}Estudiantes/buscar/${nombre}`;
    return this.http.get<Estudiante[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al buscar estudiante'))
    );
  }

  obtenerPorCI(ci: number): Observable<Estudiante> {
    const url = `${this.BASE_URL}Estudiantes/${ci}`;
    return this.http.get<Estudiante>(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al obtener estudiante'))
    );
  }

  eliminarImagen(ci: number): Observable<any> {
    const url = `${this.BASE_URL}Estudiantes/${ci}/delete-image`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al eliminar imagen'))
    );
  }

  subirImagen(ci: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.BASE_URL}Estudiantes/${ci}/upload-image`;
    return this.http.put(url, formData, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al subir imagen'))
    );
  }

  filtrarEstudiantesPorDocenteMateriaCurso(
  docente_ci: number,
  materia_id: number,
  curso_id: number
): Observable<Estudiante[]> {
  const params = {
    docente_ci: docente_ci.toString(),
    materia_id: materia_id.toString(),
    curso_id: curso_id.toString()
  };

  const url = `${this.BASE_URL}Estudiantes/filtrar-estudiantes`;
  const headers = new HttpHeaders({
    'Authorization': `${localStorage.getItem(this.TOKEN_KEY) || ''}`,
    'Accept': 'application/json'
  });

  return this.http.get<Estudiante[]>(url, { headers, params }).pipe(
    catchError((error) => {
      console.error('❌ Error al filtrar estudiantes:', error);
      return throwError(() => 'Error al filtrar estudiantes');
    })
  );
}

}
