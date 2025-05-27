import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { DocenteMateria } from '../interfaces/docenteMateria.interface';

@Injectable({ providedIn: 'root' })
export class DocenteMateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _asignacionesSubject = new Subject<DocenteMateria[]>();
  public asignaciones$ = this._asignacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

private getHeaders(): HttpHeaders {
  const token = localStorage.getItem(this.TOKEN_KEY) || '';
  return new HttpHeaders({
    'Authorization': token,
    'Accept': 'application/json'
  });
}


  obtenerAsignaciones(): Observable<DocenteMateria[]> {
    const url = `${this.BASE_URL}DocenteMateria/`;
    return this.http.get<DocenteMateria[]>(url, { headers: this.getHeaders() }).pipe(
      map(asignaciones => asignaciones.sort((a, b) => a.id! - b.id!)),
      tap(asignaciones => this._asignacionesSubject.next(asignaciones)),
      catchError((error) => {
        console.error('Error al obtener las asignaciones:', error);
        return throwError(() => 'Error al obtener las asignaciones');
      })
    );
  }

  guardarAsignacion(asignacion: Partial<DocenteMateria>): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}DocenteMateria/`;
    return this.http.post<DocenteMateria>(url, asignacion, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error(' Error al guardar la asignación:', error);
        return throwError(() => 'Error al guardar la asignación');
      })
    );
  }

  actualizarAsignacion(id: number, asignacion: DocenteMateria): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}DocenteMateria/${id}`;
    return this.http.put<DocenteMateria>(url, asignacion, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error(' Error al actualizar la asignación:', error);
        return throwError(() => 'Error al actualizar la asignación');
      })
    );
  }

  eliminarAsignacion(id: number): Observable<string> {
    const url = `${this.BASE_URL}DocenteMateria/${id}`;
    return this.http.delete<string>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error al eliminar la asignación:', error);
        return throwError(() => 'Error al eliminar la asignación');
      })
    );
  }

   obtenerAsignacionesPorDocente(docente_ci: number): Observable<DocenteMateria[]> {
    const url = `${this.BASE_URL}DocenteMateria/buscar/${docente_ci}`;
    return this.http.get<DocenteMateria[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('❌ Error al obtener asignaciones por docente:', error);
        return throwError(() => new Error('Error al obtener asignaciones'));
      })
    );
  }
}
