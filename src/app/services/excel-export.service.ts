import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Project } from '../model/project.model';
import { PlannedWorkload } from '../model/plannedWorkload.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  constructor() {}

  exportDashboardToExcel(
    project: Project,
    plannedWorkloads: PlannedWorkload[],
    tasksData: any[],
    teamData: any[]
  ) {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();

    // 1. Feuille Dashboard
    const dashboardData = this.prepareDashboardData(project);
    const dashboardSheet = XLSX.utils.json_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

    // 2. Feuille Planned Workload
    const workloadData = this.prepareWorkloadData(plannedWorkloads);
    const workloadSheet = XLSX.utils.json_to_sheet(workloadData);
    XLSX.utils.book_append_sheet(workbook, workloadSheet, 'Planned Workload');

    // 3. Feuille Tasks & Time Sheets
    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks & Time Sheets');

    // 4. Feuille Team Organization
    const teamSheet = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team Organization');

    // Générer le fichier Excel
    XLSX.writeFile(workbook, `${project.name}_Dashboard.xlsx`);
  }

  private prepareDashboardData(project: Project): any[] {
    return [
      { 'Project Name': project.name },
      { 'Status': project.status },
      { 'Start Date': project.startDate },
      { 'End Date': project.endDate },
      // Ajoutez d'autres données du dashboard ici
    ];
  }

  private prepareWorkloadData(workloads: PlannedWorkload[]): any[] {
    return workloads.map(w => ({
      'Month': w.month,
      'Year': w.year,
      'Estimated Workload per Resource': w.estimatedWorkloadPerResource,
      'Number of Resources': w.numberOfResources,
      'Total Estimated Workload': w.totalEstimatedWorkload
    }));
  }
} 