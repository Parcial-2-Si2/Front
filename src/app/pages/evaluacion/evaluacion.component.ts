import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionService } from './services/evaluacion.service';
import { Evaluacion } from './interfaces/evaluacion.interface';

@Component({
  selector: 'app-evaluacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluacion.component.html'
})
export class EvaluacionComponent {
  private evaluacionService = inject(EvaluacionService);

  evaluaciones: Evaluacion[] = [];
  evaluacionesFiltradas: Evaluacion[] = [];

  gestionFiltro: number | null = null;
  materiaFiltro: number | null = null;
  cursoFiltro: number | null = null;
  nombreFiltro: string = '';

  ngOnInit() {
    this.evaluacionService.obtenerEvaluaciones().subscribe({
      next: (data) => {
        this.evaluaciones = data;
        this.evaluacionesFiltradas = data;
      }
    });
  }

  aplicarFiltros() {
    this.evaluacionesFiltradas = this.evaluaciones.filter(ev => {
      const coincideGestion = this.gestionFiltro ? ev.gestion_id === this.gestionFiltro : true;
      const coincideMateria = this.materiaFiltro ? ev.materia_id === this.materiaFiltro : true;
      const coincideNombre = this.nombreFiltro
        ? (ev as any).nombreCompleto?.toLowerCase().includes(this.nombreFiltro.toLowerCase())
        : true;
      return coincideGestion && coincideMateria && coincideNombre;
    });
  }

  limpiarFiltros() {
    this.gestionFiltro = null;
    this.materiaFiltro = null;
    this.cursoFiltro = null;
    this.nombreFiltro = '';
    this.aplicarFiltros();
  }
}
