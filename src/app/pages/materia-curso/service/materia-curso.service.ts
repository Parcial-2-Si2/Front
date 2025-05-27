import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { MateriaCurso } from '../interfaces/materiaCurso.interface';

@Injectable({ providedIn: 'root' })
export class MateriaCursoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _asignacionesSubject = new Subject<MateriaCurso[]>();
  public asignaciones$ = this._asignacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token, // sin 'Bearer'
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ✅ GET todas las asignaciones
  obtenerAsignaciones(): Observable<MateriaCurso[]> {
    const url = `${this.BASE_URL}MateriasCurso/`;  // ← sin 's' final
    return this.http.get<MateriaCurso[]>(url, { headers: this.getHeaders() }).pipe(
      map(res => res.sort((a, b) => a.id! - b.id!)),
      tap(asignaciones => this._asignacionesSubject.next(asignaciones)),
      catchError(err => {
        console.error('❌ Error al obtener asignaciones:', err);
        return throwError(() => new Error('Error al obtener asignaciones'));
      })
    );
  }

  // ✅ POST crear una nueva asignación
  guardarAsignacion(asignacion: MateriaCurso): Observable<MateriaCurso> {
    const url = `${this.BASE_URL}MateriasCurso/`;
    return this.http.post<MateriaCurso>(url, asignacion, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('❌ Error al guardar asignación:', err);
        return throwError(() => new Error('Error al guardar asignación'));
      })
    );
  }

  // ✅ GET asignación por ID
  obtenerAsignacionPorId(id: number): Observable<MateriaCurso> {
    const url = `${this.BASE_URL}MateriasCurso/${id}`;
    return this.http.get<MateriaCurso>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('❌ Error al obtener asignación por ID:', error);
        return throwError(() => new Error('Error al obtener asignación'));
      })
    );
  }

  // ✅ PUT actualizar asignación
  actualizarAsignacion(id: number, data: MateriaCurso): Observable<MateriaCurso> {
    const url = `${this.BASE_URL}MateriasCurso/${id}`;
    return this.http.put<MateriaCurso>(url, data, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar asignación:', error);
        return throwError(() => new Error('Error al actualizar asignación'));
      })
    );
  }

  // ✅ DELETE eliminar asignación
  eliminarAsignacion(id: number): Observable<any> {
    const url = `${this.BASE_URL}MateriasCurso/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('❌ Error al eliminar asignación:', err);
        return throwError(() => new Error('Error al eliminar asignación'));
      })
    );
  }
}
