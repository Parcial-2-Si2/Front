import { Injectable } from '@angular/core';
import { environment } from '../../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse } from '../interfaces/login.interfaces';
import { Docente } from '../interfaces/docente.interfaces';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private jwtHelper = new JwtHelperService();

  private userSubject = new BehaviorSubject<Docente | null>(null);
  public user$ = this.userSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuthData();
  }

  private loadStoredAuthData(): void {
    const storedToken = this.getToken();
    const storedUserString = localStorage.getItem(this.USER_KEY);

    if (storedToken && storedUserString && !this.jwtHelper.isTokenExpired(storedToken)) {
      try {
        const storedUser = JSON.parse(storedUserString) as Docente;
        this.userSubject.next(storedUser);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data', error);
        this.logout();
      }
    } else {
      this.logout();
    }
  }
/*
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${this.BASE_URL}/auth/login`;

    return this.http.post<LoginResponse>(url, credentials).pipe(
      map((response) => {
        this.handleAuthSuccess(response);
        return response;
      }),
      catchError((error) => {
        console.error('Login failed: ', error.error.error);
        return throwError(
          () => new Error(error.error.message || 'Error de autenticación')
        );
      })
    );
  }

  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.getUser().subscribe(); // actualizar datos de usuario
    this.isAuthenticatedSubject.next(true);
  }
*/
login(credentials: LoginRequest): Observable<LoginResponse> {
  const url = `${this.BASE_URL}auth/login`;

  return this.http.post<LoginResponse>(url, credentials).pipe(
    map((response) => {
      this.handleAuthSuccess(response);  // ← ahora usamos directamente el usuario
      return response;
    }),
    catchError((error) => {
      console.error('Login failed: ', error.error.error);
      return throwError(() => new Error(error.error.message || 'Error de autenticación'));
    })
  );
}

private handleAuthSuccess(response: LoginResponse): void {
  localStorage.setItem(this.TOKEN_KEY, response.token);

  // ✅ Aquí se usa directamente el usuario devuelto por el backend
  const user: Docente = response.Usuario;
  this.userSubject.next(user);
  this.isAuthenticatedSubject.next(true);
  localStorage.setItem(this.USER_KEY, JSON.stringify(user));
}

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }
/*
  getUser(): Observable<Docente | null> {
  const token = this.getToken();
  if (!token) return of(null);

  const decoded = this.jwtHelper.decodeToken(token);
  const gmail = decoded?.sub || decoded?.gmail;

  if (!gmail) {
    console.warn('No se pudo extraer el gmail del token');
    return of(null);
  }

  const encodedGmail = encodeURIComponent(gmail); // ← para evitar errores con @
  const url = `${this.BASE_URL}Docentes/buscar/${encodedGmail}`;
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<Docente[]>(url, { headers }).pipe(
    map((docentes) => {
      const user = Array.isArray(docentes) ? docentes[0] : docentes;
      this.userSubject.next(user);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    }),
    catchError((error) => {
      console.error('Error al obtener el perfil del docente', error);
      this.logout(); // Opcional: cerrar sesión si hay error
      return of(null);
    })
  );
}
*/
  getCurrentUser(): Docente | null {
    return this.userSubject.value;
  }
}
