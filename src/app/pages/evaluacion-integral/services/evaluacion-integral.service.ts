import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { EvaluacionIntegral } from '../interfaces/evaluacionIntegral.interface';

@Injectable({ providedIn: 'root' })
export class EvaluacionIntegralService {
  private readonly BASE_URL = `${environment.baseUrl}EvaluacionIntegral/`;
  private readonly TOKEN_KEY = 'auth_token';

  private _evaluacionesSubject = new Subject<EvaluacionIntegral[]>();
  public evaluaciones$ = this._evaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  obtenerEvaluaciones(): Observable<EvaluacionIntegral[]> {
    return this.http.get<EvaluacionIntegral[]>(this.BASE_URL, { headers: this.getHeaders() }).pipe(
      tap(data => this._evaluacionesSubject.next(data)),
      catchError(error => {
        console.error('Error al obtener evaluaciones:', error);
        return throwError(() => 'Error al obtener las evaluaciones integrales');
      })
    );
  }

  guardarEvaluacion(data: EvaluacionIntegral): Observable<EvaluacionIntegral> {
    return this.http.post<EvaluacionIntegral>(this.BASE_URL, data, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al guardar la evaluacion integral'))
    );;
  }

  actualizarEvaluacion(id: number, data: EvaluacionIntegral): Observable<EvaluacionIntegral> {
    return this.http.put<EvaluacionIntegral>(`${this.BASE_URL}${id}`, data, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al guardar la evaluacion integral'))
    );;
  }

  eliminarEvaluacion(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${id}`, { headers: this.getHeaders() }).pipe(
      catchError(() => throwError(() => 'Error al guardar la evaluacion integral'))
    );;
  }
}
