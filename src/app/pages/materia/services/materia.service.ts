import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { Materia } from '../interfaces/materia.interfaces';

@Injectable({ providedIn: 'root' })
export class MateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _materiasSubject = new Subject<Materia[]>();
  public materias$ = this._materiasSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  obtenerMaterias(): Observable<Materia[]> {
    const url = `${this.BASE_URL}Materias/`;
    return this.http.get<Materia[]>(url, { headers: this.getHeaders() }).pipe(
      map(materias => materias.sort((a, b) => a.id! - b.id!)),
      tap(materias => this._materiasSubject.next(materias)),
      catchError(error => {
        console.error('Error al obtener las materias:', error);
        return throwError(() => 'Error al obtener las materias');
      })
    );
  }

  guardarMateria(materia: Materia): Observable<Materia> {
    const url = `${this.BASE_URL}Materias/`;
    return this.http.post<Materia>(url, materia, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al guardar la materia:', error);
        return throwError(() => 'Error al guardar la materia');
      })
    );
  }

  actualizarMateria(id: number, materia: Materia): Observable<Materia> {
    const url = `${this.BASE_URL}Materias/${id}`;
    return this.http.put<Materia>(url, materia, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al actualizar la materia:', error);
        return throwError(() => 'Error al actualizar la materia');
      })
    );
  }

  eliminarMateria(id: number): Observable<any> {
    const url = `${this.BASE_URL}Materias/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar la materia:', error);
        return throwError(() => 'Error al eliminar la materia');
      })
    );
  }

  obtenerMateriaPorId(id: number): Observable<Materia> {
    const url = `${this.BASE_URL}Materias/${id}`;
    return this.http.get<Materia>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener la materia por ID:', error);
        return throwError(() => 'Error al obtener la materia por ID');
      })
    );
  }
}
