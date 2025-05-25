import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { Inscripcion } from '../interfaces/inscripcion.interface';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _inscripcionesSubject = new Subject<Inscripcion[]>();
  public inscripciones$ = this._inscripcionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Accept': 'application/json'
    });
  }

  obtenerInscripciones(): Observable<Inscripcion[]> {
    const url = `${this.BASE_URL}Inscripcion/`;
    return this.http.get<Inscripcion[]>(url, { headers: this.getHeaders() }).pipe(
      tap(inscripciones => this._inscripcionesSubject.next(inscripciones)),
      catchError((error) => {
        console.error('❌ Error al obtener inscripciones:', error);
        return throwError(() => 'Error al obtener inscripciones');
      })
    );
  }

  guardarInscripcion(inscripcion: Inscripcion): Observable<Inscripcion> {
    const url = `${this.BASE_URL}Inscripcion/`;
    return this.http.post<Inscripcion>(url, inscripcion, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('❌ Error al guardar inscripción:', error);
        return throwError(() => 'Error al guardar inscripción');
      })
    );
  }

  actualizarInscripcion(id: number, inscripcion: Inscripcion): Observable<Inscripcion> {
    const url = `${this.BASE_URL}Inscripcion/${id}`;
    return this.http.put<Inscripcion>(url, inscripcion, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('❌ Error al actualizar inscripción:', error);
        return throwError(() => 'Error al actualizar inscripción');
      })
    );
  }

  eliminarInscripcion(id: number): Observable<string> {
    const url = `${this.BASE_URL}Inscripcion/${id}`;
    return this.http.delete<string>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('❌ Error al eliminar inscripción:', error);
        return throwError(() => 'Error al eliminar inscripción');
      })
    );
  }
}
