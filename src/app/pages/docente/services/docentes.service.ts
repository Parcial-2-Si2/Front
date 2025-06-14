import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Docente } from '../interfaces/docente.interface';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _docentesSubject = new Subject<Docente[]>();
  public docentes$ = this._docentesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Generar headers sin "Bearer"
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders().set('Authorization', token);
  }

  obtenerDocentes(): Observable<Docente[]> {
    const url = `${this.BASE_URL}Docentes/`;
    return this.http.get<Docente[]>(url, { headers: this.getHeaders() }).pipe(
      map(docentes => docentes.sort((a, b) => a.ci! - b.ci!)),
      tap(docentes => this._docentesSubject.next(docentes)),
      catchError(() => throwError(() => 'Error al obtener los docentes'))
    );
  }

  guardarDocente(docente: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}Docentes/`;
    return this.http.post<Docente>(url, docente, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al guardar el docente'))
    );
  }

  actualizarDocente(ci: number, docente: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}Docentes/${ci}`;
    return this.http.put<Docente>(url, docente, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al actualizar el docente'))
    );
  }

  eliminarDocente(ci: number): Observable<string> {
    const url = `${this.BASE_URL}Docentes/${ci}`;
    return this.http.delete<string>(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al eliminar el docente'))
    );
  }

  buscarDocentePorNombre(nombreCompleto: string): Observable<Docente[]> {
    const url = `${this.BASE_URL}Docentes/buscar/${nombreCompleto}`;
    return this.http.get<Docente[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al buscar docente'))
    );
  }

  obtenerDocentePorCI(ci: number): Observable<Docente> {
    const url = `${this.BASE_URL}Docentes/${ci}`;
    return this.http.get<Docente>(url, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al obtener el docente'))
    );
  }
}
