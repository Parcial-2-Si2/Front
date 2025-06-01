import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DashboardDocente, DashboardAdmin } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /*
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _dashboardDocenteSubject = new Subject<DashboardDocente>();
  public dashboardDocente$ = this._dashboardDocenteSubject.asObservable();

  private _dashboardAdminSubject = new Subject<DashboardAdmin>();
  public dashboardAdmin$ = this._dashboardAdminSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerResumenDocente(ciDocente: string): Observable<DashboardDocente> {
    const url = `${this.BASE_URL}/dashboard/docente/${ciDocente}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DashboardDocente>(url, { headers }).pipe(
      tap((data) => {
        this._dashboardDocenteSubject.next(data);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los datos del dashboard del docente');
      })
    );
  }

  obtenerResumenAdmin(): Observable<DashboardAdmin> {
    const url = `${this.BASE_URL}/dashboard/admin`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<DashboardAdmin>(url, { headers }).pipe(
      tap((data) => {
        this._dashboardAdminSubject.next(data);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los datos del dashboard del administrador');
      })
    );
  }
*/
  
  constructor() {}
}
