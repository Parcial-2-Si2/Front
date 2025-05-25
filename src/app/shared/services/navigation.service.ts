// src/app/shared/services/navigation.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private origen: string | null = null;

  setOrigen(origen: string): void {
    this.origen = origen;
  }

  getOrigen(): string | null {
    return this.origen;
  }

  clearOrigen(): void {
    this.origen = null;
  }
}
