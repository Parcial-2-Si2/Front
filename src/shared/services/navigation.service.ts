import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private origen: string | null = null;

  // Guardar el origen
  setOrigen(origen: string): void {
    this.origen = origen;
  }

  // Obtener el origen
  getOrigen(): string | null {
    return this.origen;
  }

  // Limpiar el origen
  clearOrigen(): void {
    this.origen = null;
  }
}