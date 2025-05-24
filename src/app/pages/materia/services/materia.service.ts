import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Materia } from '../interfaces/materia.interfaces';

@Injectable({
  providedIn: 'root',
})
export class MateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _materiasSubject = new Subject<Materia[]>();
  public materias$ = this._materiasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerMaterias(): Observable<Materia[]> {
    const url = `${this.BASE_URL}Materias/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Materia[]>(url, { headers }).pipe(
      map(materias => materias.sort((a, b) => a.id! - b.id!)),
      tap((materias) => this._materiasSubject.next(materias)),
      catchError(() => throwError(() => 'Error al obtener las materias'))
    );
  }

  guardarMateria(materia: Materia): Observable<Materia> {
    const url = `${this.BASE_URL}Materias/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Materia>(url, materia, { headers }).pipe(
      catchError(() => throwError(() => 'Error al guardar la materia'))
    );
  }

  actualizarMateria(id: number, materia: Materia): Observable<Materia> {
    const url = `${this.BASE_URL}Materias/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Materia>(url, materia, { headers }).pipe(
      catchError(() => throwError(() => 'Error al actualizar la materia'))
    );
  }

  eliminarMateria(id: number): Observable<string> {
    const url = `${this.BASE_URL}Materias/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<string>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al eliminar la materia'))
    );
  }
}