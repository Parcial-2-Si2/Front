import { Routes } from "@angular/router";
import { DocenteComponent } from "./docente/docente.component";
import { EstudianteComponent } from "./estudiante/estudiante.component";
import { CursoComponent } from "./curso/curso.component";
import { MateriaComponent } from "./materia/materia.component";
import { DocenteMateriaComponent } from "./docente-materia/docente-materia.component";
import { InscripcionComponent } from "./inscripcion/inscripcion.component";
import { MateriaCursoComponent } from "./materia-curso/materia-curso.component";
//import { DashboardComponent } from "./dashboard/dashboard.component";


export const PagesRoutes: Routes = [
  //{
   // path: '',
   // component: DashboardComponent,
 // },
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
 // {
  //  path: 'reportes',
  //  loadChildren: () => import('./reportes/reportes.routes').then(m => m.ReportesRoutes),
 // }
  
];