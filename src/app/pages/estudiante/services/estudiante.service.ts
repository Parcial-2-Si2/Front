import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroment';
import { Observable, Subject, map, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Estudiante } from '../interfaces/estudiante.interface';


@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly BASE_URL = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _estudiantesSubject = new Subject<Estudiante[]>();
  public estudiantes$ = this._estudiantesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerEstudiantes(): Observable<Estudiante[]> {
  const url = `${this.BASE_URL}Estudiantes/`;
  const token = localStorage.getItem(this.TOKEN_KEY) || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<Estudiante[]>(url, { headers }).pipe(
    map(estudiantes => estudiantes.sort((a, b) => a.ci! - b.ci!)),
    tap(estudiantes => this._estudiantesSubject.next(estudiantes)),
    catchError(() => throwError(() => 'Error al obtener los estudiantes'))
  );
}


   guardarEstudiante(estudiante: FormData): Observable<Estudiante> {
    const url = `${this.BASE_URL}Estudiantes/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Estudiante>(url, estudiante, { headers }).pipe(
      catchError(() => throwError(() => 'Error al guardar el estudiante'))
    );
  }



  actualizarEstudiante(ci: number, estudiante: Estudiante): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.BASE_URL}${ci}`, estudiante, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al actualizar estudiante')));
  }

  eliminarEstudiante(ci: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${ci}`, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al eliminar estudiante')));
  }

  buscarPorNombre(nombre: string): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.BASE_URL}buscar/${nombre}`, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al buscar estudiante')));
  }

  obtenerPorCI(ci: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.BASE_URL}${ci}`, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al obtener estudiante')));
  }

  eliminarImagen(ci: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${ci}/delete-image`, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al eliminar imagen')));
  }

  subirImagen(ci: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.BASE_URL}${ci}/upload-image`, formData, { headers: this.getHeaders() })
      .pipe(catchError(() => throwError(() => 'Error al subir imagen')));
  }
}
