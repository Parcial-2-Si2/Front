import { Component } from '@angular/core';
import { BoletinService } from './services/boletin.service';
import { BoletinResponse } from './interfaces/boletin.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './boletin.component.html',
  styleUrls: ['./boletin.component.css']
})
export class BoletinComponent {
  estudiante_ci: number = 0;
  nombre_estudiante: string = '';
  gestionSeleccionada: string = '';
  data!: BoletinResponse;
  gestionDisponible: string[] = [];
  boletinFiltrado: any[] = [];

  constructor(private boletinService: BoletinService) {}

  buscar(): void {
    if (!this.estudiante_ci) return;
    this.boletinService.obtenerBoletin(this.estudiante_ci).subscribe({
      next: (res) => {
        this.data = res;
        this.nombre_estudiante = `Estudiante ${res.estudiante_ci}`;
        this.gestionDisponible = Object.keys(res.boletin);
        this.gestionSeleccionada = this.gestionDisponible[0] ?? '';
        this.aplicarFiltro();
      },
      error: () => alert('No se pudo obtener el boletín.')
    });
  }

  aplicarFiltro(): void {
    if (this.gestionSeleccionada && this.data?.boletin) {
      this.boletinFiltrado = this.data.boletin[this.gestionSeleccionada] || [];
    }
  }

  descargarPDF(): void {
    this.boletinService.descargarBoletinPDF(this.estudiante_ci, this.nombre_estudiante, this.gestionSeleccionada).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url);
    });
  }

  descargarExcel(): void {
    this.boletinService.descargarBoletinExcel(this.estudiante_ci, this.nombre_estudiante, this.gestionSeleccionada).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url);
    });
  }
}
