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

  obtenerAsignaciones(): Observable<MateriaCurso[]> {
    const url = `${this.BASE_URL}MateriasCurso/`;
    return this.http.get<MateriaCurso[]>(url, { headers: this.getHeaders() }).pipe(
      map(res => res.sort((a, b) => a.id! - b.id!)),
      tap(asignaciones => this._asignacionesSubject.next(asignaciones)),
      catchError(err => {
        console.error('❌ Error al obtener asignaciones:', err);
        return throwError(() => 'Error al obtener asignaciones');
      })
    );
  }

  guardarAsignacion(asignacion: MateriaCurso): Observable<MateriaCurso> {
    const url = `${this.BASE_URL}MateriasCurso/`;
    return this.http.post<MateriaCurso>(url, asignacion, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('❌ Error al guardar asignación:', err);
        return throwError(() => 'Error al guardar asignación');
      })
    );
  }

  actualizarAsignacion(id: number, asignacion: MateriaCurso): Observable<MateriaCurso> {
    const url = `${this.BASE_URL}MateriasCurso/${id}`;
    return this.http.put<MateriaCurso>(url, asignacion, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('❌ Error al actualizar asignación:', err);
        return throwError(() => 'Error al actualizar asignación');
      })
    );
  }

  eliminarAsignacion(id: number): Observable<any> {
    const url = `${this.BASE_URL}MateriasCurso/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('❌ Error al eliminar asignación:', err);
        return throwError(() => 'Error al eliminar asignación');
      })
    );
  }
}
