import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ProjectSelectionService } from '../../../services/DashboardSelection.service';
import { Subscription } from 'rxjs';
import { Project } from '../../../model/project.model';
import { TaskTrackerService } from 'src/app/services/taskTracker.service';
import { TaskTracker } from 'src/app/model/taskTracker.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { PsrService } from 'src/app/services/psr.service';
import { Psr } from 'src/app/model/psr.model';
import { Devis } from 'src/app/model/devis.model';
import { WorkloadDetail } from 'src/app/model/WorkloadDetail.model';
import { WorkloadDetailService } from 'src/app/services/WorkloadDetails.service';
import { InvoicingDetail } from 'src/app/model/InvoicingDetail.model';
import { InvoicingDetailService } from 'src/app/services/InvoicingDetail.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tasks-time-shests',
  templateUrl: './tasks-time-shests.component.html',
  styleUrls: ['./tasks-time-shests.component.scss']
})
export class TasksTimeShestsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedYear: number | null = null;
  selectedProject: Project | null = null;
  selectedDevis: Devis | null = null;
  taskTrackers: TaskTracker[] = [];
  filteredTaskTrackers: TaskTracker[] = [];
  teamMembers: TeamMember[] = [];
  groupedTasksByMonth: { [month: string]: TaskTracker[] } = {};
  workloadDetails: WorkloadDetail[] = [];
  invoicingDetails: InvoicingDetail[] = [];
  private subscription = new Subscription();
  months: string[] = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  colspanValueForAdmin: number = 1;

  constructor(
    private projectSelectionService: ProjectSelectionService,
    private taskTrackerService: TaskTrackerService,
    private projectService: ProjectService,
    private psrService: PsrService,
    private workloadDetailService: WorkloadDetailService,
    private invoicingDetailService: InvoicingDetailService,
    public authService: AuthService
  ) {}

ngOnInit() {
  // 1. Définir la valeur du colspan selon le rôle
  this.colspanValueForAdmin = this.authService.getCurrentUserRole() === 'ADMIN' ? 2 : 1;

  // 2. Écoute du projet sélectionné
  this.subscription.add(
    this.projectSelectionService.selectedProject$.subscribe((project: Project | null) => {
      this.selectedProject = project;
      if (project) {
        this.loadProjectData(project);
      } else {
        this.taskTrackers = [];
        this.filteredTaskTrackers = [];
        this.groupedTasksByMonth = {};
      }
    })
  );

  // 3. Écoute du devis sélectionné
  this.subscription.add(
    this.projectSelectionService.selectedDevis$.subscribe((devis: Devis | null) => {
      this.selectedDevis = devis;
      this.workloadDetails = [];
      this.invoicingDetails = [];

      if (devis && devis.id) {
        this.loadDevisData(devis.id);
      }
    })
  );
}



  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

ngOnChanges(changes: SimpleChanges) {
  console.log('Changes detected:', changes);

  if (changes['selectedYear'] && this.selectedProject) {
    this.filterTasksByYear();

    // 🔄 Détecter le mois de la première tâche filtrée
    const firstTask = this.filteredTaskTrackers[0];
    if (firstTask?.startDate) {
      const date = new Date(firstTask.startDate);
      console.log('Sending first task month to Team Organization:', date);
      this.projectSelectionService.setSelectedMonth(date);
    }

    this.groupTasksByMonth();
  }
}

  private loadProjectData(project: Project) {
    console.log('Loading project data for:', project);
    if (!project.id) {
      console.error('Project ID is missing');
      return;
    }

    // D'abord, charger les PSR du projet
    this.psrService.getByProject(project.id).subscribe({
      next: (psrs: Psr[]) => {
        console.log('PSRs loaded:', psrs);
        if (psrs.length > 0) {
          // Charger les task trackers pour chaque PSR
          const psrIds = psrs.map(psr => psr.id).filter((id): id is number => id !== undefined);
          this.loadTaskTrackersForPsrs(psrIds);
        } else {
          console.log('No PSRs found for project');
          this.taskTrackers = [];
          this.filterTasksByYear();
          this.groupTasksByMonth();
        }
      },
      error: (error) => {
        console.error('Error loading PSRs:', error);
      }
    });

    // Charger les membres de l'équipe
    this.projectService.getMembersByProject(project.id).subscribe({
      next: (members) => {
        console.log('Team members loaded:', members);
        // Vérifier les coûts des membres
        members.forEach(member => {
          console.log(`Member: ${member.name}, Cost: ${member.cost}, Role: ${member.role}`);
          if (!member.cost) {
            console.warn(`Warning: No cost defined for member ${member.name}`);
          }
        });
        this.teamMembers = members;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
      }
    });
  }

  private loadTaskTrackersForPsrs(psrIds: number[]) {
    const allTaskTrackers: TaskTracker[] = [];
    let completedRequests = 0;

    psrIds.forEach(psrId => {
      this.taskTrackerService.getByPsr(psrId).subscribe({
        next: (trackers) => {
          console.log(`Task trackers loaded for PSR ${psrId}:`, trackers);
          allTaskTrackers.push(...trackers);
          completedRequests++;

          if (completedRequests === psrIds.length) {
            this.taskTrackers = allTaskTrackers;
            this.filterTasksByYear();
            this.groupTasksByMonth();
          }
        },
        error: (error) => {
          console.error(`Error loading task trackers for PSR ${psrId}:`, error);
          completedRequests++;

          if (completedRequests === psrIds.length) {
            this.taskTrackers = allTaskTrackers;
            this.filterTasksByYear();
            this.groupTasksByMonth();
          }
        }
      });
    });
  }

  private filterTasksByYear() {
    console.log('Filtering tasks by year:', this.selectedYear);
    if (!this.selectedYear) {
      this.filteredTaskTrackers = this.taskTrackers;
      return;
    }

    this.filteredTaskTrackers = this.taskTrackers.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate.getFullYear() === this.selectedYear;
    });
    console.log('Filtered tasks:', this.filteredTaskTrackers);
  }

  private groupTasksByMonth() {
    console.log('Grouping tasks by month');
    this.groupedTasksByMonth = {};
    this.months.forEach(month => {
      this.groupedTasksByMonth[month] = [];
    });
    
    this.filteredTaskTrackers.forEach(task => {
      const date = new Date(task.startDate);
      const month = date.toLocaleString('en-US', { month: 'long' });

      console.log(`[DEBUG groupTasksByMonth] Before update - Task ${task.who}, Month: ${month}, Original estimatedMD: ${task.estimatedMD}, workedMD: ${task.workedMD}`);

      // IMPORTANT: Overwrite task.estimatedMD with the value from devis (per resource)
      // This ensures consistency for remaining calculation
      task.estimatedMD = this.getEstimatedWorkloadPerResourceForTask(task);
      task.remainingMD = task.estimatedMD - (task.workedMD || 0); // Recalculate remainingMD here

      console.log(`[DEBUG groupTasksByMonth] After update - Task ${task.who}, Month: ${month}, Updated estimatedMD: ${task.estimatedMD}, remainingMD: ${task.remainingMD}`);

      if (this.groupedTasksByMonth[month]) {
        this.groupedTasksByMonth[month].push(task);
      }
    });

    // Regrouper les tâches par membre d'équipe pour chaque mois
    Object.keys(this.groupedTasksByMonth).forEach(month => {
      this.groupedTasksByMonth[month] = this.groupTasksByTeamMember(this.groupedTasksByMonth[month]);
    });

    console.log('Grouped tasks by month:', this.groupedTasksByMonth);
  }

  private groupTasksByTeamMember(tasks: TaskTracker[]): TaskTracker[] {
    const groupedTasks = new Map<string, TaskTracker>();

    tasks.forEach(task => {
      if (!task.who) return;
      console.log(`[DEBUG groupTasksByTeamMember] Processing task: ${task.who}, description: ${task.description}, estimatedMD: ${task.estimatedMD}, workedMD: ${task.workedMD}, remainingMD: ${task.remainingMD}`);

      if (!groupedTasks.has(task.who)) {
        groupedTasks.set(task.who, {
          ...task,
          workedMD: task.workedMD || 0,
          estimatedMD: task.estimatedMD || 0, // This should be the per-resource estimated workload
          remainingMD: task.remainingMD || 0, // This should be already calculated from above
          description: '' // Clear description as it's a grouped task
        });
        console.log(`[DEBUG groupTasksByTeamMember] New grouped task for ${task.who}: estimatedMD=${groupedTasks.get(task.who)!.estimatedMD}, workedMD=${groupedTasks.get(task.who)!.workedMD}, remainingMD=${groupedTasks.get(task.who)!.remainingMD}`);
      } else {
        const existingTask = groupedTasks.get(task.who)!;
        console.log(`[DEBUG groupTasksByTeamMember] Existing grouped task for ${task.who} before update: estimatedMD=${existingTask.estimatedMD}, workedMD=${existingTask.workedMD}, remainingMD=${existingTask.remainingMD}`);

        existingTask.workedMD = (existingTask.workedMD || 0) + (task.workedMD || 0);
        // estimatedMD should remain the same as it represents the monthly planned for the resource.
        // The remainingMD should be calculated *after* the workedMD accumulation.
        existingTask.remainingMD = (existingTask.estimatedMD || 0) - existingTask.workedMD;
        console.log(`[DEBUG groupTasksByTeamMember] Existing grouped task for ${task.who} after update: estimatedMD=${existingTask.estimatedMD}, workedMD=${existingTask.workedMD}, remainingMD=${existingTask.remainingMD}`);
      }
    });

    return Array.from(groupedTasks.values());
  }

  getMonthTotal(tasks: TaskTracker[], field: 'workedMD' | 'estimatedMD' | 'remainingMD'): number {
    return tasks.reduce((sum, task) => sum + (task[field] || 0), 0);
  }

  getMonthEffectiveCost(tasks: TaskTracker[]): number {
    return tasks.reduce((sum, task) => sum + this.getEffectiveCost(task), 0);
  }

  getMonthRemainingCost(tasks: TaskTracker[]): number {
    return tasks.reduce((sum, task) => sum + this.getRemainingCost(task), 0);
  }

getFirstActiveMonth(): Date | null {
  const task = this.filteredTaskTrackers[0];
  if (!task?.startDate) return null;
  return new Date(task.startDate);
}

  getDailyCostForTask(task: TaskTracker): number {
    console.log('Getting daily cost for task:', task);
    console.log('Current team members:', this.teamMembers);
    
    // Trouver le membre de l'équipe correspondant au 'who' (initiales) de la tâche
    const teamMember = this.teamMembers.find(member => {
      const match = member.initial?.toLowerCase() === task.who?.toLowerCase();
      console.log(`Comparing ${member.initial?.toLowerCase()} with ${task.who?.toLowerCase()}: ${match}`);
      return match;
    });

    if (teamMember) {
      console.log('Found team member:', teamMember);
      if (typeof teamMember.cost === 'number') {
        console.log(`Using defined cost for ${task.who}: ${teamMember.cost} TND`);
        console.log(`getDailyCostForTask returning: ${teamMember.cost}`);
        return teamMember.cost;
      }

      // Si le coût n'est pas trouvé, essayer de déterminer un coût par défaut basé sur le rôle
      if (teamMember.role) {
        const defaultCost = this.getDefaultCostByRole(teamMember.role);
        console.log(`Using default cost for ${task.who} (${teamMember.role}): ${defaultCost} TND`);
        console.log(`getDailyCostForTask returning: ${defaultCost}`);
        return defaultCost;
      }
    }

    console.log(`No team member or cost found for ${task.who}, using default value 0`);
    console.log(`getDailyCostForTask returning: 0`);
    return 0;
  }

  private getDefaultCostByRole(role: string): number {
    console.log('Getting default cost for role:', role);
    switch (role.toUpperCase()) {
      case 'JUNIOR':
        return 200;
      case 'INTERMEDIAIRE':
        return 350;
      case 'SENIOR':
        return 500;
      case 'SENIOR_MANAGER':
        return 800;
      default:
        console.warn(`No default cost defined for role: ${role}`);
        return 0;
    }
  }

  getEffectiveCost(task: TaskTracker): number {
    console.log('Calculating effective cost for task:', task);
    const dailyCost = this.getDailyCostForTask(task);
    console.log(`Daily cost for task ${task.description} (${task.who}): ${dailyCost}`);
    const workedMD = task.workedMD || 0;
    console.log(`Worked MD for task ${task.description} (${task.who}): ${workedMD}`);
    const effectiveCost = workedMD * dailyCost;
    console.log(`Effective cost calculated: ${effectiveCost}`);
    return effectiveCost;
  }

getPlannedCost(task: TaskTracker): number {
  const dailyCost = this.getDailyCostForTask(task);
  const estimatedWorkload = this.getEstimatedWorkloadPerResourceForTask(task); // ✅ nouvelle méthode
  return estimatedWorkload * dailyCost;
}


  getRemainingCost(task: TaskTracker): number {
    const dailyCost = this.getDailyCostForTask(task);
    // Utiliser l'estimatedMD de la tâche pour le calcul du remainingMD
    const remainingMD = (task.estimatedMD || 0) - (task.workedMD || 0);
    return remainingMD * dailyCost;
  }
  
getEstimatedWorkloadPerResourceForTask(task: TaskTracker): number {
  if (!this.workloadDetails || !task?.startDate) return 0;

  const taskMonth = new Date(task.startDate).toLocaleString('en-US', { month: 'long' });

  const matchingDetail = this.workloadDetails.find(detail => {
    const [month] = this.parsePeriod(detail.period);
    return month === taskMonth;
  });

  return matchingDetail?.estimatedWorkload || 0;
}

 getHolidaysForTask(task: TaskTracker): string[] {
  const teamMember = this.teamMembers.find(member =>
    member.initial?.toLowerCase() === task.who?.toLowerCase()
  );

  if (!teamMember || !teamMember.holiday?.length) return [];

  const taskStartDate = new Date(task.startDate);
  const taskMonth = taskStartDate.getMonth();
  const taskYear = taskStartDate.getFullYear();

  return teamMember.holiday
    .map(h => h.split('|')[0]) // 🟢 extrait "2025-06-03"
    .filter(dateStr => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === taskMonth && d.getFullYear() === taskYear;
    })
    .map(dateStr => {
      const label = teamMember.holiday.find(h => h.startsWith(dateStr))?.split('|')[1] || '';
      return `${new Date(dateStr).toLocaleDateString('fr-FR')} (${label})`;
    });
}


  private loadDevisData(devisId: number) {
    // Charger les détails de charge de travail
    this.workloadDetailService.getByDevisId(devisId).subscribe({
      next: (details) => {
        console.log('Workload details loaded:', details);
        this.workloadDetails = details;
      },
      error: (error) => {
        console.error('Error loading workload details:', error);
      }
    });

    // Charger les détails de facturation
    this.invoicingDetailService.getByDevisId(devisId).subscribe({
      next: (details) => {
        console.log('Invoicing details loaded:', details);
        this.invoicingDetails = details;
      },
      error: (error) => {
        console.error('Error loading invoicing details:', error);
      }
    });
  }

 getMonthPlannedWorkload(month: string): number {
  if (!this.selectedDevis?.id) return 0; // ✅ Pas de devis sélectionné
  const detail = this.workloadDetails.find(d => this.parsePeriod(d.period)[0] === month);
  return detail?.totalEstimatedWorkload || 0;
}

getMonthPlannedCost(month: string): number {
  if (!this.selectedDevis?.id) return 0; // ✅ Pas de devis sélectionné
  const detail = this.invoicingDetails.find(d => {
    const invoicingMonth = new Date(d.invoicingDate).toLocaleString('en-US', { month: 'long' });
    return invoicingMonth === month;
  });
  return detail?.amount || 0;
}


  getOverallRemainingWorkload(month: string): number {
    const plannedWorkload = this.getMonthPlannedWorkload(month);
    const effectiveWorkload = this.getMonthTotal(this.groupedTasksByMonth[month] || [], 'workedMD');
    return plannedWorkload - effectiveWorkload;
  }

  getOverallRemainingCost(month: string): number {
    const plannedCost = this.getMonthPlannedCost(month);
    const effectiveCost = this.getMonthEffectiveCost(this.groupedTasksByMonth[month] || []);
    return plannedCost - effectiveCost;
  }

  private parsePeriod(period: string): [string, number | null] {
    const cleanedPeriod = period.trim().toLowerCase();
    const parts = cleanedPeriod.split(' ');

    const monthMapping: { [key: string]: string } = {
      'january': 'January',
      'february': 'February',
      'march': 'March',
      'april': 'April',
      'may': 'May',
      'june': 'June',
      'july': 'July',
      'august': 'August',
      'september': 'September',
      'october': 'October',
      'november': 'November',
      'december': 'December',
      'jan': 'January',
      'feb': 'February',
      'mar': 'March',
      'apr': 'April',
      'jun': 'June',
      'jul': 'July',
      'aug': 'August',
      'sep': 'September',
      'sept': 'September',
      'oct': 'October',
      'nov': 'November',
      'dec': 'December'
    };

    if (parts.length === 2) {
      let month = parts[0].toLowerCase();
      const year = parseInt(parts[1]);
      const mappedMonth = monthMapping[month] || 'Unknown';
      return [mappedMonth, isNaN(year) ? null : year];
    }

    for (const [key, value] of Object.entries(monthMapping)) {
      if (cleanedPeriod.includes(key)) {
        return [value, null];
      }
    }

    return ['Unknown', null];
  }

  getTaskMonth(task: TaskTracker): string {
    if (!task || !task.startDate) return '';
    return new Date(task.startDate).toLocaleString('en-US', { month: 'long' });
  }

}
