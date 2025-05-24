// src/app/pages/docente/docente-detalle/docente-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteMateriaService } from './services/docente-materia.service';
import { MateriaService } from '../materia/services/materia.service';
import { DocenteMateria } from './interfaces/docenteMateria.interface';
import { Materia } from '../materia/interfaces/materia.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Docente } from '../auth/interfaces/docente.interfaces';
import { DocenteService } from '../docente/services/docentes.service';

@Component({
  selector: 'app-docente-detalle',
  standalone: true,
  templateUrl: './docente-materia.component.html',
  styleUrl: './docente-materia.component.css',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DocenteMateriaComponent implements OnInit {
  docenteSeleccionado!: Docente;
  docenteCI!: number;
  materiasAsignadas: DocenteMateria[] = [];
  todasLasMaterias: Materia[] = [];
  materiaSeleccionadaId: number | null = null;
  editando = false;
  navigationService: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dmService: DocenteMateriaService,
    private materiaService: MateriaService,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.docenteCI = Number(this.route.snapshot.paramMap.get('ci'));
    
    this.obtenerMaterias();
    this.obtenerAsignaciones();
  }

  obtenerDocente() {
  this.docenteService.obtenerDocentePorCI(this.docenteCI).subscribe({
    next: (docente) => {
      //this.docenteSeleccionado = docente;
    },
    error: () => {
      console.error('Error al obtener datos del docente');
    },
  });
}

  obtenerMaterias() {
    this.materiaService.obtenerMaterias().subscribe((materias) => {
      this.todasLasMaterias = materias;
    });
  }

  obtenerAsignaciones() {
    this.dmService.obtenerPorDocente(this.docenteCI).subscribe((res) => {
      this.materiasAsignadas = res;
    });
  }

  asignarMateria() {
    if (!this.materiaSeleccionadaId) return;
    this.dmService
      .asignarMateria({
        docente_ci: this.docenteCI,
        materia_id: this.materiaSeleccionadaId,
        fecha: new Date().toISOString().split('T')[0],
      })
      .subscribe(() => {
        this.obtenerAsignaciones();
        this.materiaSeleccionadaId = null;
      });
  }

  eliminarAsignacion(id: number) {
    this.dmService.eliminarAsignacion(id).subscribe(() => {
      this.obtenerAsignaciones();
    });
  }

   regresar(): void {
    const origen = this.navigationService.getOrigen();
    if (origen === 'docente') {
      this.router.navigate(['/dashboard/materia']);
    } else if (origen === 'ventas') {
      this.router.navigate(['/dashboard/docente']);
    } else {
      this.router.navigate(['/dashboard/docente']);
    }
    
    this.navigationService.clearOrigen();
  }
}
