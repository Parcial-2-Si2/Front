import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../enviroment';
import { Curso } from '../interfaces/curso.interface';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _cursosSubject = new Subject<Curso[]>();
  public cursos$ = this._cursosSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders({
      'Authorization': token,
      'Accept': 'application/json'
    });
  }

  obtenerCursos(): Observable<Curso[]> {
    const url = `${this.BASE_URL}Curso/`;
    return this.http.get<Curso[]>(url, { headers: this.getHeaders() }).pipe(
      map(cursos => cursos.sort((a, b) => a.id! - b.id!)),
      tap(cursos => this._cursosSubject.next(cursos)),
      catchError((error) => {
        console.error('Error al obtener los cursos:', error);
        return throwError(() => 'Error al obtener los cursos');
      })
    );
  }

  obtenerCursoPorId(id: number): Observable<Curso> {
    const url = `${this.BASE_URL}Curso/${id}`;
    return this.http.get<Curso>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('❌ Error al obtener el curso por ID:', error);
        return throwError(() => 'Error al obtener el curso por ID');
      })
    );
  }

  guardarCurso(curso: Curso): Observable<Curso> {
    const url = `${this.BASE_URL}Curso/`;
    return this.http.post<Curso>(url, curso, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al guardar el curso:', error);
        return throwError(() => 'Error al guardar el curso');
      })
    );
  }

  actualizarCurso(id: number, curso: Curso): Observable<Curso> {
    const url = `${this.BASE_URL}Curso/${id}`;
    return this.http.put<Curso>(url, curso, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar el curso:', error);
        return throwError(() => 'Error al actualizar el curso');
      })
    );
  }

  eliminarCurso(id: number): Observable<string> {
    const url = `${this.BASE_URL}Curso/${id}`;
    return this.http.delete<string>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al eliminar el curso:', error);
        return throwError(() => 'Error al eliminar el curso');
      })
    );
  }

  buscarCursoPorNombre(nombre: string): Observable<Curso[]> {
    const url = `${this.BASE_URL}Curso/buscar/${nombre}`;
    return this.http.get<Curso[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al buscar el curso:', error);
        return throwError(() => 'Error al buscar el curso');
      })
    );
  }
}
