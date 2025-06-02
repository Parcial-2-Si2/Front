/*import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { BoletinResponse } from '../interfaces/boletin.interface';

@Injectable({ providedIn: 'root' })
export class BoletinService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  /**
   * Obtiene el boletín de un estudiante por CI
   */
  /*
  obtenerBoletin(estudianteCi: number): Observable<BoletinResponse> {
    const url = `${this.BASE_URL}Evaluacion/boletin/${estudianteCi}`;
    
    return this.http.get<BoletinResponse>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('[BoletinService] Error al obtener boletín:', error);

        if (error.status === 404) {
          return throwError(() => new Error(`No se encontraron datos para el estudiante con CI: ${estudianteCi}`));
        }

        if (error.status === 0 || error.status >= 500) {
          return throwError(() => new Error(`No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en ${this.BASE_URL}`));
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Descarga el boletín como PDF
   */
  /*
  descargarBoletinPDF(estudianteCi: number, nombreEstudiante: string, gestion?: string): Observable<Blob> {
    let url = `${this.BASE_URL}Evaluacion/boletin/${estudianteCi}/pdf`;
    if (gestion) {
      url += `?gestion=${gestion}`;
    }

    return this.http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Authorization': localStorage.getItem(this.TOKEN_KEY) || '',
        'Accept': 'application/pdf'
      })
    }).pipe(
      catchError(error => {
        console.error('[BoletinService] Error al descargar PDF:', error);
        return throwError(() => 'Error al descargar PDF');
      })
    );
  }

  /**
   * Descarga el boletín como Excel
   */
  /*
  descargarBoletinExcel(estudianteCi: number, nombreEstudiante: string, gestion?: string): Observable<Blob> {
    let url = `${this.BASE_URL}Evaluacion/boletin/${estudianteCi}/excel`;
    if (gestion) {
      url += `?gestion=${gestion}`;
    }

    return this.http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Authorization': localStorage.getItem(this.TOKEN_KEY) || '',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    }).pipe(
      catchError(error => {
        console.error('[BoletinService] Error al descargar Excel:', error);
        return throwError(() => 'Error al descargar Excel');
      })
    );
  }
}
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { BoletinEstudianteCompletoResponse } from '../interfaces/boletin.interface';

@Injectable({ providedIn: 'root' })
export class BoletinService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({ 'Authorization': token });
  }

  obtenerBoletinCompleto(ci: number, year: number): Observable<BoletinEstudianteCompletoResponse> {
    const url = `${this.BASE_URL}Estudiantes/${ci}/boletin-completo`;
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<BoletinEstudianteCompletoResponse>(url, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(err => {
        console.error('[BoletinCompletoService] Error:', err);
        return throwError(() => new Error('Error al obtener el boletín completo'));
      })
    );
  }
}
