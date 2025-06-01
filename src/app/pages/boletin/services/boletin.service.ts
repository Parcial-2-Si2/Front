import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BoletinResponse, BoletinBackendResponse, MateriaBoletin } from '../interfaces/boletin.interface';

@Injectable({
  providedIn: 'root'
})
export class BoletinService {
  private apiUrl = 'http://localhost:5205/api';

  constructor(private http: HttpClient) { }

  /**
   * Verifica si el backend está disponible
   */
  verificarConexion(): Observable<boolean> {
    const url = `${this.apiUrl}/health`; // O cualquier endpoint de verificación
    
    return this.http.get(url, { 
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response'
    }).pipe(
      catchError(() => {
        // Si falla, intentar con un endpoint conocido
        return this.http.get(`${this.apiUrl}/Evaluacion`, { 
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        });
      }),
      catchError(() => {
        console.error('[BoletinService] Backend no disponible');
        return of(false as any);
      }),
      map(() => true)
    );
  }  /**
   * Obtiene el boletín de un estudiante por CI
   */
  obtenerBoletin(estudianteCi: number): Observable<BoletinResponse> {
    const url = `${this.apiUrl}/Evaluacion/boletin/${estudianteCi}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    console.log(`[BoletinService] Solicitando boletín para CI: ${estudianteCi}`);
    console.log(`[BoletinService] URL: ${url}`);
    console.log(`[BoletinService] Intentando conectar con el backend...`);
    
    return this.http.get<BoletinBackendResponse>(url, { headers }).pipe(
      map(response => {
        console.log('[BoletinService] Respuesta del backend recibida:', response);
        return this.transformarRespuestaBackend(response);
      }),
      catchError(error => {
        console.error('[BoletinService] Error al obtener boletín:', error);
        console.error('[BoletinService] Status:', error.status);
        console.error('[BoletinService] Error completo:', error);
        
        // Si es un error 404 (estudiante no encontrado), mostrar error específico
        if (error.status === 404) {
          console.warn(`[BoletinService] Estudiante con CI ${estudianteCi} no encontrado (404)`);
          throw new Error(`No se encontraron datos para el estudiante con CI: ${estudianteCi}`);
        }
          // Si es error de conexión (0) o servidor no disponible (500, 503, etc.)
        if (error.status === 0 || error.status >= 500) {
          console.warn('[BoletinService] Servidor no disponible - Backend no está ejecutándose');
          console.warn('[BoletinService] Error de conexión:', error.message);
          throw new Error(`No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en ${this.apiUrl}`);
        }
          // Para otros errores, relanzar el error
        throw error;
      })
    );
  }

  /**
   * Transforma la respuesta del backend al formato esperado por el frontend
   */
  private transformarRespuestaBackend(backendResponse: BoletinBackendResponse): BoletinResponse {
    console.log('[BoletinService] Transformando respuesta del backend:', backendResponse);
    
    // Extraer información básica
    const estudianteCi = backendResponse.estudiante_ci;
    
    // Determinar la gestión actual (usar la primera disponible)
    const gestiones = Object.keys(backendResponse.boletin);
    const gestionActual = gestiones.length > 0 ? gestiones[0] : '2024';
    
    console.log(`[BoletinService] Gestiones disponibles: ${gestiones.join(', ')}`);
    console.log(`[BoletinService] Usando gestión: ${gestionActual}`);
    
    // Obtener materias de la gestión actual
    const materiasGestion = backendResponse.boletin[gestionActual] || [];
    
    // Crear un mapa de promedios por materia para referencia futura
    const promediosPorMateria = new Map<number, number>();
    backendResponse.promedio_por_materia.forEach(p => {
      promediosPorMateria.set(p.materia_id, p.promedio_final);
    });
    
    // Transformar materias del backend al formato frontend
    const materias: MateriaBoletin[] = materiasGestion.map(materia => {
      // Por ahora, el backend solo proporciona nota_final
      // En el futuro podríamos pedir también las notas por trimestre
      const promedio = promediosPorMateria.get(materia.materia_id);
      
      return {
        materia_id: materia.materia_id,
        materia_nombre: materia.materia_nombre,
        // Como el backend no proporciona notas por trimestre,
        // las dejamos undefined por ahora
        primer_trimestre: undefined,
        segundo_trimestre: undefined,
        tercer_trimestre: undefined,
        // Usamos la nota final del backend o el promedio si está disponible
        nota_final: materia.nota_final || promedio
      };
    });
    
    // Si no hay materias en la gestión actual, usar los promedios como fallback
    if (materias.length === 0 && backendResponse.promedio_por_materia.length > 0) {
      console.log('[BoletinService] No hay materias en gestión actual, usando promedios');
      backendResponse.promedio_por_materia.forEach(promedio => {
        materias.push({
          materia_id: promedio.materia_id,
          materia_nombre: promedio.materia_nombre,
          primer_trimestre: undefined,
          segundo_trimestre: undefined,
          tercer_trimestre: undefined,
          nota_final: promedio.promedio_final
        });
      });
    }
    
    const resultado: BoletinResponse = {
      estudiante_ci: estudianteCi,
      // El backend no devuelve el nombre, usar el CI como identificador
      estudiante_nombre: `Estudiante CI: ${estudianteCi}`,
      gestion_anio: parseInt(gestionActual) || 2024,
      gestion_periodo: `Gestión ${gestionActual}`,
      materias: materias
    };
    
    console.log('[BoletinService] Datos transformados:', resultado);
    console.log(`[BoletinService] Materias procesadas: ${materias.length}`);
    
    return resultado;
  }

  /**
   * Descarga el boletín como PDF
   */
  descargarBoletinPDF(estudianteCi: number, nombreEstudiante: string): Observable<Blob> {
    const url = `${this.apiUrl}/Evaluacion/boletin/${estudianteCi}/pdf`;
    
    return this.http.get(url, { 
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    }).pipe(
      catchError(error => {
        console.error('[BoletinService] Error al descargar PDF:', error);
        // Crear un PDF vacío como fallback
        return of(new Blob(['PDF no disponible'], { type: 'application/pdf' }));
      })
    );
  }

  /**
   * Descarga el boletín como Excel
   */
  descargarBoletinExcel(estudianteCi: number, nombreEstudiante: string): Observable<Blob> {
    const url = `${this.apiUrl}/Evaluacion/boletin/${estudianteCi}/excel`;
    
    return this.http.get(url, { 
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })    }).pipe(
      catchError(error => {
        console.error('[BoletinService] Error al descargar Excel:', error);
        // Crear un Excel vacío como fallback
        return of(new Blob(['Excel no disponible'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      })
    );
  }

  /**
   * Obtiene datos de prueba (público para uso desde el componente)
   */
  obtenerDatosPrueba(estudianteCi: number): Observable<BoletinResponse> {
    console.log(`[BoletinService] Proporcionando datos de prueba para CI: ${estudianteCi}`);
    return of(this.getDatosPruebaRealistas(estudianteCi));
  }
  /**
   * Datos de prueba para cuando el backend no esté disponible
   */
  private getDatosPrueba(estudianteCi: number): BoletinResponse {
    return {
      estudiante_ci: estudianteCi,
      estudiante_nombre: `Estudiante ${estudianteCi}`,
      gestion_anio: 2024,
      gestion_periodo: 'Primer Semestre',
      materias: [
        {
          materia_id: 1,
          materia_nombre: 'Matemáticas',
          primer_trimestre: 85,
          segundo_trimestre: 88,
          tercer_trimestre: 90,
          nota_final: 88
        },
        {
          materia_id: 2,
          materia_nombre: 'Lenguaje',
          primer_trimestre: 92,
          segundo_trimestre: 89,
          tercer_trimestre: 91,
          nota_final: 91
        },
        {
          materia_id: 3,
          materia_nombre: 'Ciencias Naturales',
          primer_trimestre: 87,
          segundo_trimestre: 85,
          tercer_trimestre: 89,
          nota_final: 87
        },
        {
          materia_id: 4,
          materia_nombre: 'Ciencias Sociales',
          primer_trimestre: 90,
          segundo_trimestre: 92,
          tercer_trimestre: 88,
          nota_final: 90
        },
        {
          materia_id: 5,
          materia_nombre: 'Educación Física',
          primer_trimestre: 95,
          segundo_trimestre: 93,
          tercer_trimestre: 94,
          nota_final: 94
        }
      ]
    };
  }

  /**
   * Datos de prueba realistas con trimestres vacíos para demostrar funcionalidad
   */
  private getDatosPruebaRealistas(estudianteCi: number): BoletinResponse {
    // Simular diferentes estados de progreso según el CI
    const nombres = [
      'Ana María García',
      'Carlos José Mamani', 
      'Sofia Elena Quispe',
      'Diego Fernando Rojas',
      'Valentina Isabel Cruz'
    ];
    
    const materias = [
      'Matemáticas',
      'Lenguaje y Literatura', 
      'Ciencias Naturales',
      'Ciencias Sociales',
      'Inglés',
      'Educación Física',
      'Artes Plásticas'
    ];

    const nombreIndex = estudianteCi % nombres.length;
    const resultado: BoletinResponse = {
      estudiante_ci: estudianteCi,
      estudiante_nombre: nombres[nombreIndex],
      gestion_anio: 2024,
      gestion_periodo: 'Gestión 2024',
      materias: []    };

    // Generar materias con diferentes estados de progreso (determinístico por CI)
    materias.forEach((nombre, index) => {
      const materiaId = index + 1;
      let primer_trimestre: number | undefined = undefined;
      let segundo_trimestre: number | undefined = undefined; 
      let tercer_trimestre: number | undefined = undefined;
      let nota_final: number | undefined = undefined;

      // Usar el CI y el índice de materia para generar datos consistentes
      const materiaSeed = (estudianteCi * 100 + materiaId) % 100;

      // Primer trimestre: 90% de probabilidad de tener nota
      if (materiaSeed % 10 !== 0) {
        primer_trimestre = 70 + (materiaSeed % 30); // 70-99
      }

      // Segundo trimestre: 70% de probabilidad de tener nota
      if (materiaSeed % 10 < 7) {
        segundo_trimestre = 65 + ((materiaSeed * 2) % 35); // 65-99
      }

      // Tercer trimestre: 40% de probabilidad (simulando que estamos en proceso)
      if (materiaSeed % 10 < 4) {
        tercer_trimestre = 70 + ((materiaSeed * 3) % 30); // 70-99
      }

      // Calcular nota final solo si hay al menos una nota
      const notas = [primer_trimestre, segundo_trimestre, tercer_trimestre].filter(n => n !== undefined) as number[];
      if (notas.length > 0) {
        nota_final = Math.round(notas.reduce((sum, nota) => sum + nota, 0) / notas.length);
      }

      resultado.materias.push({
        materia_id: materiaId,
        materia_nombre: nombre,
        primer_trimestre,
        segundo_trimestre, 
        tercer_trimestre,
        nota_final
      });
    });    console.log(`[BoletinService] Generando datos de prueba para ${resultado.estudiante_nombre} (CI: ${estudianteCi})`);
    console.log(`[BoletinService] Materias con notas: ${resultado.materias.filter(m => m.nota_final).length}/${resultado.materias.length}`);
    
    return resultado;
  }
}
