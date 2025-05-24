import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocenteMateria } from '../interfaces/docenteMateria.interface';
@Injectable({
  providedIn: 'root',
})
export class DocenteMateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _asignacionesSubject = new Subject<DocenteMateria[]>();
  public asignaciones$ = this._asignacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerAsignaciones(): Observable<DocenteMateria[]> {
    const url = `${this.BASE_URL}DocenteMateria/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DocenteMateria[]>(url, { headers }).pipe(
      tap(asignaciones => this._asignacionesSubject.next(asignaciones)),
      catchError(() => throwError(() => 'Error al obtener las asignaciones'))
    );
  }

  guardarAsignacion(asignacion: DocenteMateria): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}DocenteMateria/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<DocenteMateria>(url, asignacion, { headers }).pipe(
      catchError(() => throwError(() => 'Error al guardar la asignación'))
    );
  }

  actualizarAsignacion(id: number, asignacion: DocenteMateria): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}DocenteMateria/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<DocenteMateria>(url, asignacion, { headers }).pipe(
      catchError(() => throwError(() => 'Error al actualizar la asignación'))
    );
  }

  eliminarAsignacion(id: number): Observable<string> {
    const url = `${this.BASE_URL}DocenteMateria/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<string>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al eliminar la asignación'))
    );
  }

  buscarPorDocente(docente_ci: number): Observable<DocenteMateria[]> {
    const url = `${this.BASE_URL}DocenteMateria/buscar/${docente_ci}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DocenteMateria[]>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al buscar asignaciones por docente'))
    );
  }
  obtenerPorDocente(ci: number): Observable<DocenteMateria[]> {
    const url = `${this.BASE_URL}DocenteMateria/buscar/${ci}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DocenteMateria[]>(url, { headers }).pipe(
      tap((res) => this._asignacionesSubject.next(res)),
      catchError(() => throwError(() => 'Error al obtener las asignaciones del docente'))
    );
  }

  asignarMateria(asignacion: DocenteMateria): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}DocenteMateria/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<DocenteMateria>(url, asignacion, { headers }).pipe(
      catchError(() => throwError(() => 'Error al asignar la materia al docente'))
    );
  }
}
