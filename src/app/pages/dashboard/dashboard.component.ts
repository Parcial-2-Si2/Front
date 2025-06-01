import { AfterViewInit, Component } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { Dashboard } from './interfaces/dashboard.interface';
import { AlertsService } from '../../../shared/services/alerts.service';

declare const echarts: any;
declare const ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  datos?: Dashboard;

  constructor(
    private dashboardService: DashboardService,
    private alertsService: AlertsService
  ) {}

  
}
