import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Dashboard } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /*
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _dashboardSubject = new Subject<Dashboard>();
  public dashboard$ = this._dashboardSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<Dashboard> {
    const url = `${this.BASE_URL}/dashboard/resumen`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Dashboard>(url, { headers }).pipe(
      tap((data) => {
        this._dashboardSubject.next(data);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los datos del dashboard');
      })
    );
    
  }
*/
  
  
}
