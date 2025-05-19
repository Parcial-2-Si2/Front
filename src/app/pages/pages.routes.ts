import { Routes } from "@angular/router";
import { DocenteComponent } from "./docente/docente.component";
//import { DashboardComponent } from "./dashboard/dashboard.component";


export const PagesRoutes: Routes = [
  //{
   // path: '',
   // component: DashboardComponent,
 // },
  {
    path: 'Docente',
    component: DocenteComponent,
  },
 // {
  //  path: 'reportes',
  //  loadChildren: () => import('./reportes/reportes.routes').then(m => m.ReportesRoutes),
 // }
  
];