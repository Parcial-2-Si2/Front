import { Routes } from "@angular/router";
import { DocenteComponent } from "./docente/docente.component";
import { EstudianteComponent } from "./estudiante/estudiante.component";
import { CursoComponent } from "./curso/curso.component";
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
 // {
  //  path: 'reportes',
  //  loadChildren: () => import('./reportes/reportes.routes').then(m => m.ReportesRoutes),
 // }
  
];