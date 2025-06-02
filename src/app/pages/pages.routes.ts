import { Routes } from "@angular/router";
import { DocenteComponent } from "./docente/docente.component";
import { EstudianteComponent } from "./estudiante/estudiante.component";
import { CursoComponent } from "./curso/curso.component";
import { MateriaComponent } from "./materia/materia.component";
import { DocenteMateriaComponent } from "./docente-materia/docente-materia.component";
import { InscripcionComponent } from "./inscripcion/inscripcion.component";
import { MateriaCursoComponent } from "./materia-curso/materia-curso.component";
import { FiltroEstudiantesComponent } from "./filtro-estudiantes/filtro-estudiantes.component";
import { GestionComponent } from "./gestion/gestion.component";
import { EvaluacionIntegralComponent } from "./evaluacion-integral/evaluacion-integral.component";
import { TipoEvaluacionComponent } from "./tipo-evaluacion/tipo-evaluacion.component";
import { EvaluacionComponent } from "./evaluacion/evaluacion.component";

import { EstimacionesComponent } from "./estimaciones/estimaciones.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BoletinComponent } from "./boletin/boletin.component";



export const PagesRoutes: Routes = [
  {
   path: '',
   component: DashboardComponent,
 },
 {
    path: 'usuario',
    component: DocenteComponent,
  },
  {
    path: 'docentes',
    component: DocenteComponent,
  },
  {
    path: 'estudiantes',
    component: EstudianteComponent,
  },
  {
    path: 'curso',
    component: CursoComponent,
  },
  {
    path: 'materias',
    component: MateriaComponent,
  },
  {
    path: 'docente-materia/:ci',
    component: DocenteMateriaComponent,
  },
  {
    path: 'inscripcion',
    component: InscripcionComponent,
  },
  {
    path: 'materia-curso/:id',
    component: MateriaCursoComponent,
  },
  {
  path: 'filtrar-estudiantes',
  component: FiltroEstudiantesComponent,
  },
  {
  path: 'gestion',
  component: GestionComponent,
  },
  {
  path: 'evaluacion-integral',
  component: EvaluacionIntegralComponent,
  },
  {
  path: 'tipo-evaluacion',
  component: TipoEvaluacionComponent,
  },
  {
  path: 'evaluacion',
  component: EvaluacionComponent,
  },
  {
  path: 'boletines',
  component:BoletinComponent ,
  },
  {
  path: 'estimacion-notas',
  component: EstimacionesComponent,
  },

 // {
  //  path: 'reportes',
  //  loadChildren: () => import('./reportes/reportes.routes').then(m => m.ReportesRoutes),
 // }
  
];