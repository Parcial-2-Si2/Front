import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { Estudiante } from '../../estudiante/interfaces/estudiante.interface';

@Injectable({ providedIn: 'root' })
export class FiltroEstudiantesService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': token } : {}) // ✅ sin Bearer, solo si existe token
    });
    return headers;
  }

  filtrarEstudiantes(docente_ci: number, materia_id: number, curso_id: number): Observable<Estudiante[]> {
    const url = `${this.BASE_URL}Estudiantes/filtrar-estudiantes`; // ← con E mayúscula si el backend lo usa así

    return this.http.get<Estudiante[]>(url, {
      headers: this.getHeaders(),
      params: {
        docente_ci: docente_ci.toString(),
        materia_id: materia_id.toString(),
        curso_id: curso_id.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('❌ Error al filtrar estudiantes:', error);
        return throwError(() => new Error('Error al filtrar estudiantes'));
      })
    );
  }
}
