import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoletinCompletoResponse } from '../interfaces/estimaciones.interface';


@Injectable({ providedIn: 'root' })
export class EstimacionesService {

   private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  obtenerBoletinCompleto(docente_ci: number, materia_id: number, curso_id: number, year?: number): Observable<BoletinCompletoResponse> {
    const params: any = {
      docente_ci: docente_ci.toString(),
      materia_id: materia_id.toString(),
      curso_id: curso_id.toString()
    };
    if (year) params.year = year.toString();

    return this.http.get<BoletinCompletoResponse>(`${this.BASE_URL}Estudiantes/boletin-completo-estudiantes-filtrados`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(err => {
        console.error('[BoletinCompletoService] Error al obtener boletín completo:', err);
        return throwError(() => new Error('Error al obtener el boletín completo'));
      })
    );
  }
}
