// src/app/pages/evaluacion/services/evaluacion.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroment';
import { catchError, map, Observable, Subject, throwError, tap } from 'rxjs';
import { Evaluacion } from '../interfaces/evaluacion.interface';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _evaluacionSubject = new Subject<Evaluacion[]>();
  public evaluaciones$ = this._evaluacionSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  obtenerEvaluaciones(): Observable<Evaluacion[]> {
    const url = `${this.BASE_URL}Evaluacion/`;
    return this.http.get<Evaluacion[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => this._evaluacionSubject.next(data)),
      catchError(error => {
        console.error('Error al obtener evaluaciones:', error);
        return throwError(() => 'Error al obtener evaluaciones');
      })
    );
  }

  obtenerEvaluacionPorId(id: number): Observable<Evaluacion> {
    const url = `${this.BASE_URL}Evaluacion/${id}`;
    return this.http.get<Evaluacion>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  guardarEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    const url = `${this.BASE_URL}Evaluacion/`;
    return this.http.post<Evaluacion>(url, evaluacion, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  actualizarEvaluacion(id: number, evaluacion: Evaluacion): Observable<Evaluacion> {
    const url = `${this.BASE_URL}Evaluacion/${id}`;
    return this.http.put<Evaluacion>(url, evaluacion, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  eliminarEvaluacion(id: number): Observable<any> {
    const url = `${this.BASE_URL}Evaluacion/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  obtenerPorEstudiante(ci: number): Observable<Evaluacion[]> {
    const url = `${this.BASE_URL}Evaluacion/estudiante/${ci}`;
    return this.http.get<Evaluacion[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  guardarAsistencia(evaluacion: Evaluacion): Observable<Evaluacion> {
    const url = `${this.BASE_URL}Evaluacion/asistencia/`;
    return this.http.post<Evaluacion>(url, evaluacion, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  obtenerAsistenciaFinal(ci: number, gestion_id: number, materia_id: number): Observable<any> {
    const url = `${this.BASE_URL}Evaluacion/asistencia/estudiante/${ci}/gestion/${gestion_id}/materia/${materia_id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  obtenerBoletin(ci: number): Observable<any> {
    const url = `${this.BASE_URL}Evaluacion/boletin/${ci}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  pasarNotasAFinal(curso_id: number, gestion_id: number): Observable<any> {
    const url = `${this.BASE_URL}Evaluacion/paso_notas/curso/${curso_id}/gestion/${gestion_id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  obtenerBoletinPorMateria(gestion_id: number, materia_id: number, curso_id: number): Observable<any> {
    const url = `${this.BASE_URL}Evaluacion/boletin/gestion/${gestion_id}/materia/${materia_id}/curso/${curso_id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
