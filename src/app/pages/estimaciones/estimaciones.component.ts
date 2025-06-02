// boletin-completo-docente.component.ts
import { Component } from '@angular/core';
import { EstimacionesService } from './services/estimaciones.service';
import { BoletinCompletoResponse, BoletinEstudiante, ResumenBoletin } from './interfaces/estimaciones.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletin-completo-docente',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './estimaciones.component.html',
  styleUrls: ['./estimaciones.component.css']
})
export class EstimacionesComponent {
  docente_ci: number = 0;
  materia_id: number = 0;
  curso_id: number = 0;
  year: number = new Date().getFullYear();

  resultado!: BoletinCompletoResponse;
  estudiantes: BoletinEstudiante[] = [];
  resumen!: ResumenBoletin;

  cargando: boolean = false;
  error: string = '';

  constructor(private boletinService: EstimacionesService) {}

  generarBoletin(): void {
    this.cargando = true;
    this.error = '';

    this.boletinService.obtenerBoletinCompleto(
      this.docente_ci,
      this.materia_id,
      this.curso_id,
      this.year
    ).subscribe({
      next: (res) => {
        this.resultado = res;
        this.estudiantes = res.estudiantes;
        this.resumen = res.resumen;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.message || 'Error desconocido al generar el boletín';
        this.cargando = false;
      }
    });
  }
}
