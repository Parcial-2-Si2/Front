import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { TipoEvaluacion } from '../interfaces/tipoEvaluacion.interface';

@Injectable({ providedIn: 'root' })
export class TipoEvaluacionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _tiposEvaluacionSubject = new Subject<TipoEvaluacion[]>();
  public tiposEvaluacion$ = this._tiposEvaluacionSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  obtenerTiposEvaluacion(): Observable<TipoEvaluacion[]> {
    const url = `${this.BASE_URL}TipoEvaluacion/`;
    return this.http.get<TipoEvaluacion[]>(url, { headers: this.getHeaders() }).pipe(
      map(data => data.sort((a, b) => a.id! - b.id!)),
      tap(tipos => this._tiposEvaluacionSubject.next(tipos)),
      catchError(error => {
        console.error('Error al obtener los tipos de evaluación:', error);
        return throwError(() => 'Error al obtener los tipos de evaluación');
      })
    );
  }

  guardarTipoEvaluacion(tipo: TipoEvaluacion): Observable<TipoEvaluacion> {
    const url = `${this.BASE_URL}TipoEvaluacion/`;
    return this.http.post<TipoEvaluacion>(url, tipo, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al guardar el tipo de evaluación:', error);
        return throwError(() => 'Error al guardar el tipo de evaluación');
      })
    );
  }

  actualizarTipoEvaluacion(id: number, tipo: TipoEvaluacion): Observable<TipoEvaluacion> {
    const url = `${this.BASE_URL}TipoEvaluacion/${id}`;
    return this.http.put<TipoEvaluacion>(url, tipo, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al actualizar el tipo de evaluación:', error);
        return throwError(() => 'Error al actualizar el tipo de evaluación');
      })
    );
  }

  eliminarTipoEvaluacion(id: number): Observable<any> {
    const url = `${this.BASE_URL}TipoEvaluacion/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar el tipo de evaluación:', error);
        return throwError(() => 'Error al eliminar el tipo de evaluación');
      })
    );
  }

  obtenerTipoEvaluacionPorId(id: number): Observable<TipoEvaluacion> {
    const url = `${this.BASE_URL}TipoEvaluacion/${id}`;
    return this.http.get<TipoEvaluacion>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener el tipo de evaluación por ID:', error);
        return throwError(() => 'Error al obtener el tipo de evaluación por ID');
      })
    );
  }
}
