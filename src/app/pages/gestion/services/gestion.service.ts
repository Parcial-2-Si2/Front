import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { Gestion } from '../interfaces/gestion.interface';

@Injectable({ providedIn: 'root' })
export class GestionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _gestionesSubject = new Subject<Gestion[]>();
  public gestiones$ = this._gestionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token, // sin Bearer
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  obtenerGestiones(): Observable<Gestion[]> {
    const url = `${this.BASE_URL}Gestion/`;
    return this.http.get<Gestion[]>(url, { headers: this.getHeaders() }).pipe(
      map(res => res.sort((a, b) => a.id! - b.id!)),
      tap(gestiones => this._gestionesSubject.next(gestiones)),
      catchError((error) => {
        console.error('Error al obtener gestiones:', error);
        return throwError(() => 'Error al obtener gestiones');
      })
    );
  }

  guardarGestion(gestion: Gestion): Observable<Gestion> {
    const url = `${this.BASE_URL}Gestion/with-notas`;
    return this.http.post<Gestion>(url, gestion, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al guardar la gestión:', error);
        return throwError(() => new Error('Error al guardar la gestión'));
      })
    );
  }

  actualizarGestion(id: number, gestion: Gestion): Observable<Gestion> {
    const url = `${this.BASE_URL}Gestion/${id}`;
    return this.http.put<Gestion>(url, gestion, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar la gestión:', error);
        return throwError(() => new Error('Error al actualizar la gestión'));
      })
    );
  }

  eliminarGestion(id: number): Observable<any> {
    const url = `${this.BASE_URL}Gestion/${id}`;
    return this.http.delete(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al eliminar la gestión:', error);
        return throwError(() => new Error('Error al eliminar la gestión'));
      })
    );
  }

  obtenerGestionPorId(id: number): Observable<Gestion> {
    const url = `${this.BASE_URL}Gestion/${id}`;
    return this.http.get<Gestion>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener gestión por ID:', error);
        return throwError(() => new Error('Error al obtener gestión por ID'));
      })
    );
  }
} 
