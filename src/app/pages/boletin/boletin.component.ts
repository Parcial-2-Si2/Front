import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoletinService } from './services/boletin.service';
import { BoletinResponse, MateriaBoletin } from './interfaces/boletin.interface';

@Component({
  selector: 'app-boletin',
  imports: [CommonModule, FormsModule],
  templateUrl: './boletin.component.html',
  styleUrl: './boletin.component.css'
})
export class BoletinComponent {
  estudianteCi: string = '';
  boletinData: BoletinResponse | null = null;
  cargando = false;
  error: string | null = null;
  verificandoConexion = false;
  estadoConexion: 'desconocido' | 'conectado' | 'desconectado' = 'desconocido';

  constructor(private boletinService: BoletinService) {
    // Verificar conexión al inicializar
    this.verificarConexionInicial();
  }

  /**
   * Busca el boletín del estudiante
   */
  buscarBoletin(): void {
    if (!this.estudianteCi.trim()) {
      this.error = 'Por favor ingrese el CI del estudiante';
      return;
    }

    const ci = parseInt(this.estudianteCi.trim());
    if (isNaN(ci) || ci <= 0) {
      this.error = 'Por favor ingrese un CI válido';
      return;
    }

    this.cargando = true;
    this.error = null;
    this.boletinData = null;

    console.log(`[BoletinComponent] Buscando boletín para CI: ${ci}`);

    this.boletinService.obtenerBoletin(ci).subscribe({
      next: (data) => {
        console.log('[BoletinComponent] Datos del boletín recibidos:', data);
        this.boletinData = data;
        this.cargando = false;
      },      error: (error) => {
        console.error('[BoletinComponent] Error al obtener boletín:', error);
        
        // Personalizar el mensaje de error según el tipo
        if (error.message && error.message.includes('No se puede conectar')) {
          this.error = 'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.';
          this.estadoConexion = 'desconectado';
        } else if (error.message && error.message.includes('No se encontraron datos')) {
          this.error = error.message;
        } else {
          this.error = 'Error al obtener el boletín del estudiante';
        }
        
        this.cargando = false;
      }
    });
  }
  /**
   * Calcula el promedio general del estudiante
   */
  calcularPromedioGeneral(): number {
    if (!this.boletinData?.materias?.length) return 0;
    
    const materiasConNota = this.boletinData.materias.filter(materia => materia.nota_final);
    if (materiasConNota.length === 0) return 0;
    
    const promedio = materiasConNota.reduce((sum, materia) => {
      return sum + (materia.nota_final || 0);
    }, 0) / materiasConNota.length;
    
    return Math.round(promedio * 100) / 100;
  }

  /**
   * Formatea la nota para mostrar en la tabla
   */
  formatearNota(nota?: number): string {
    return nota ? nota.toString() : '-';
  }

  /**
   * Verifica si una materia tiene al menos una nota
   */
  tieneAlgunaNota(materia: MateriaBoletin): boolean {
    return !!(materia.primer_trimestre || materia.segundo_trimestre || materia.tercer_trimestre || materia.nota_final);
  }
  /**
   * Obtiene la clase CSS para la nota
   */
  getClaseNota(nota?: number): string {
    if (!nota) return '';
    if (nota >= 90) return 'nota-excelente';
    if (nota >= 80) return 'nota-buena';
    if (nota >= 70) return 'nota-regular';
    return 'nota-baja';
  }

  /**
   * Obtiene el color del badge de Bootstrap para las notas
   */
  getColorBadge(nota?: number): string {
    if (!nota) return 'secondary';
    if (nota >= 90) return 'success';
    if (nota >= 80) return 'primary';
    if (nota >= 70) return 'warning';
    return 'danger';
  }

  /**
   * Descarga el boletín como PDF
   */
  descargarPDF(): void {
    if (!this.boletinData) return;

    console.log('[BoletinComponent] Descargando PDF...');
    this.boletinService.descargarBoletinPDF(
      this.boletinData.estudiante_ci, 
      this.boletinData.estudiante_nombre
    ).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `boletin_${this.boletinData!.estudiante_ci}.pdf`);
      },
      error: (error) => {
        console.error('[BoletinComponent] Error al descargar PDF:', error);
        this.error = 'Error al descargar el archivo PDF';
      }
    });
  }

  /**
   * Descarga el boletín como Excel
   */
  descargarExcel(): void {
    if (!this.boletinData) return;

    console.log('[BoletinComponent] Descargando Excel...');
    this.boletinService.descargarBoletinExcel(
      this.boletinData.estudiante_ci, 
      this.boletinData.estudiante_nombre
    ).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `boletin_${this.boletinData!.estudiante_ci}.xlsx`);
      },
      error: (error) => {
        console.error('[BoletinComponent] Error al descargar Excel:', error);
        this.error = 'Error al descargar el archivo Excel';
      }
    });
  }

  /**
   * Maneja la descarga de archivos
   */
  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
    console.log(`[BoletinComponent] Archivo ${nombreArchivo} descargado`);
  }

  /**
   * Limpia el formulario
   */
  limpiar(): void {
    this.estudianteCi = '';
    this.boletinData = null;
    this.error = null;
    this.cargando = false;
  }

  /**
   * Maneja el evento Enter en el input
   */
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.buscarBoletin();
    }
  }
  /**
   * TrackBy function para optimizar el ngFor
   */
  trackByMateriaId(index: number, materia: MateriaBoletin): number {
    return materia.materia_id;
  }

  /**
   * Verifica la conexión con el backend al inicializar
   */
  private verificarConexionInicial(): void {
    this.verificandoConexion = true;
    this.boletinService.verificarConexion().subscribe({
      next: (conectado) => {
        this.estadoConexion = conectado ? 'conectado' : 'desconectado';
        this.verificandoConexion = false;
        if (!conectado) {
          console.warn('[BoletinComponent] Backend no disponible al inicializar');
        }
      },
      error: () => {
        this.estadoConexion = 'desconectado';
        this.verificandoConexion = false;
      }
    });
  }

  /**
   * Verifica manualmente la conexión con el backend
   */
  verificarConexion(): void {
    this.verificandoConexion = true;
    this.error = null;
    
    this.boletinService.verificarConexion().subscribe({
      next: (conectado) => {
        this.estadoConexion = conectado ? 'conectado' : 'desconectado';
        this.verificandoConexion = false;
        
        if (conectado) {
          this.error = null;
        } else {
          this.error = 'No se puede conectar con el servidor backend';
        }
      },
      error: () => {
        this.estadoConexion = 'desconectado';
        this.verificandoConexion = false;
        this.error = 'Error al verificar la conexión con el servidor';
      }
    });
  }

  /**
   * Obtiene el icono para el estado de conexión
   */
  getIconoConexion(): string {
    switch (this.estadoConexion) {
      case 'conectado': return 'bi-wifi';
      case 'desconectado': return 'bi-wifi-off';
      default: return 'bi-question-circle';
    }
  }

  /**
   * Obtiene la clase CSS para el estado de conexión
   */
  getClaseConexion(): string {
    switch (this.estadoConexion) {
      case 'conectado': return 'text-success';
      case 'desconectado': return 'text-danger';
      default: return 'text-muted';
    }
  }
  /**
   * Obtiene el texto para el estado de conexión
   */
  getTextoConexion(): string {
    switch (this.estadoConexion) {
      case 'conectado': return 'Conectado al servidor';
      case 'desconectado': return 'Servidor no disponible';
      default: return 'Verificando conexión...';
    }
  }
  /**
   * Utiliza datos de prueba para demostración cuando el backend no está disponible
   */
  usarDatosPrueba(): void {
    if (!this.estudianteCi.trim()) {
      this.error = 'Por favor ingrese un CI para generar datos de demostración';
      return;
    }

    const ci = parseInt(this.estudianteCi.trim());
    if (isNaN(ci) || ci <= 0) {
      this.error = 'Por favor ingrese un CI válido para generar datos de demostración';
      return;
    }

    this.cargando = true;
    this.error = null;
    this.boletinData = null;

    console.log(`[BoletinComponent] Usando datos de prueba para CI: ${ci}`);

    this.boletinService.obtenerDatosPrueba(ci).subscribe({
      next: (data) => {
        console.log('[BoletinComponent] Datos de prueba recibidos:', data);
        this.boletinData = data;
        this.cargando = false;
        
        // Mostrar mensaje informativo
        this.error = 'Mostrando datos de demostración (no son datos reales del backend)';
        setTimeout(() => {
          this.error = null;
        }, 5000);
      },
      error: (error) => {
        console.error('[BoletinComponent] Error al obtener datos de prueba:', error);
        this.error = 'Error al generar datos de demostración';
        this.cargando = false;
      }
    });
  }}
