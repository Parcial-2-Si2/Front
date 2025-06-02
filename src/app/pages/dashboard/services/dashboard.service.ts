import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';
import {
  EstadisticasDocente,
  EstadisticasGlobales
} from '../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      Authorization: token,
      Accept: 'application/json'
    });
  }

  // ADMINISTRADOR
  getEstadisticasAdmin(): Observable<any> {
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/admin/conteos-globales`, {
      headers: this.getHeaders()
    });
  }

  getAsistenciaGlobal(gestionId?: number): Observable<any> {
    const params = gestionId ? `?gestion_id=${gestionId}` : '';
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/admin/asistencia-global${params}`, {
      headers: this.getHeaders()
    });
  }

  getEvaluacionesContadas(
    gestionId?: number,
    anio?: number,
    periodo?: string
  ): Observable<any> {
    const params = new URLSearchParams();
    if (gestionId) params.append('gestion_id', gestionId.toString());
    if (anio) params.append('anio', anio.toString());
    if (periodo) params.append('periodo', periodo);

    return this.http.get(`${this.BASE_URL}Docentes/dashboard/admin/evaluaciones-contadas?${params.toString()}`, {
      headers: this.getHeaders()
    });
  }

  // DOCENTE
  getEstadisticasDocente(ci: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/docente/${ci}/estudiantes-por-curso`, {
      headers: this.getHeaders()
    });
  }

  getAsistenciaPromedio(ci: string, gestionId?: number): Observable<any> {
    const params = gestionId ? `?gestion_id=${gestionId}` : '';
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/docente/${ci}/asistencia-promedio${params}`, {
      headers: this.getHeaders()
    });
  }

  getNotasPromedio(ci: string, gestionId?: number): Observable<any> {
    const params = gestionId ? `?gestion_id=${gestionId}` : '';
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/docente/${ci}/notas-promedio${params}`, {
      headers: this.getHeaders()
    });
  }

  getMejoresPeores(ci: string, year?: number): Observable<any> {
    const params = year ? `?year=${year}` : '';
    return this.http.get(`${this.BASE_URL}Docentes/dashboard/docente/${ci}/mejores-peores-estudiantes${params}`, {
      headers: this.getHeaders()
    });
  }
}
