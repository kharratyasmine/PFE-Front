import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { Project, Status } from '../../model/project.model';
import { User } from '../../model/user.model';
import { Team } from '../../model/Team.model';
import { Subscription } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSelectChange } from '@angular/material/select';
import { ProjectSelectionService } from '../../services/DashboardSelection.service';
import { DashboardService } from '../../services/dashboard.service';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../model/devis.model';
import { TaskTrackerService } from 'src/app/services/taskTracker.service';
import { TaskTracker } from 'src/app/model/taskTracker.model';
import { PsrService } from 'src/app/services/psr.service';
import { Psr } from 'src/app/model/psr.model';
import { ExcelService } from '../../services/excel.service';
import { TeamOrgaDashboardComponent } from './team-orga-dashboard/team-orga-dashboard.component';
import { TasksTimeShestsComponent } from './tasks-time-shests/tasks-time-shests.component';
import { PlannedWorkloadComponent } from './planned-workload/planned-workload.component';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { WorkloadDetailService } from 'src/app/services/WorkloadDetails.service';
import { WorkloadDetail } from 'src/app/model/WorkloadDetail.model';
import { InvoicingDetailService } from 'src/app/services/InvoicingDetail.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit, OnDestroy {
  totalMembers: number = 0;
  activeProjects: number = 0;
  activeTeams: number = 0;

  displayedColumns: string[] = ['name', 'status', 'startDate'];
  recentProjects: Project[] = [];
  projects: Project[] = [];
  selectedProject: Project | null = null;
  selectedDevis: Devis | null = null;
  devisList: Devis[] = [];

  groupedMonthlyWorkload: { [month: string]: { planned: number, effective: number } } = {};
  private taskTrackers: TaskTracker[] = [];
  private allPsrs: Psr[] = [];

  private projectStatusChart: Chart | null = null;
  private teamMembersChart: Chart | null = null;
  private subscription: Subscription = new Subscription();
  private allProjects: Project[] = [];
  private allTeams: Team[] = [];
  private allUsers: User[] = [];
  yearsList: number[] = [];
  selectedYear: number | null = null;

  // Properties to hold chart instances
  private workloadCharts: (Chart | null)[] = [null, null, null, null]; // For Q1, Q2, Q3, Q4
  private effortCharts: (Chart | null)[] = [null, null, null, null]; // For Q1, Q2, Q3, Q4
  private cumulativeMonthlyWorkload: { [month: string]: { planned: number, effective: number } } = {};
  private workloadDetails: WorkloadDetail[] = [];
  private months: string[] = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];
  @ViewChild(TeamOrgaDashboardComponent) teamOrga!: TeamOrgaDashboardComponent;
  @ViewChild(TasksTimeShestsComponent) tasksTime!: TasksTimeShestsComponent;
  @ViewChild(PlannedWorkloadComponent) workload!: PlannedWorkloadComponent;
  teamMembers: any[] = []; // Ajout de la propriété teamMembers
  invoicingDetails: any[] = []; // Ajout de la propriété invoicingDetails

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private projectSelectionService: ProjectSelectionService,
    private dashboardService: DashboardService,
    private devisService: DevisService,
    private taskTrackerService: TaskTrackerService,
    private psrService: PsrService,
    private excelService: ExcelService,
    private workloadDetailService: WorkloadDetailService,
    private invoicingDetailService: InvoicingDetailService,
  ) { }

  ngOnInit() {
    this.workloadDetails = []; // Assurez-vous que les détails de la charge de travail sont vides au démarrage
    this.loadInitialData();
    // L'abonnement à selectedDevis$ est géré via onDevisChange et loadDevisForProject
    // et n'est plus nécessaire ici pour éviter les problèmes de synchronisation d'état.
    // this.subscription.add(
    //   this.projectSelectionService.selectedDevis$.subscribe(devis => {
    //     this.selectedDevis = devis;
    //   })
    // );
    // Load saved year from service
    this.selectedYear = this.projectSelectionService.getSelectedYear();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.projectStatusChart) {
      this.projectStatusChart.destroy();
    }
    if (this.teamMembersChart) {
      this.teamMembersChart.destroy();
    }
    // Destroy monthly workload charts
    this.workloadCharts.forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    // Destroy project effort charts (placeholders)
    this.effortCharts.forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  onProjectChange(event: MatSelectChange) {
    this.selectedProject = event.value;
    this.projectSelectionService.setSelectedProject(this.selectedProject);
    this.loadDevisForProject();
    if (this.selectedProject) {
      this.loadProjectData(this.selectedProject);
    } else {
      // Clear task data and charts if no project is selected
      this.taskTrackers = [];
      this.groupedMonthlyWorkload = {};
      for (let q = 1; q <= 4; q++) { this.initializeMonthlyWorkloadChart(q); }
      for (let q = 1; q <= 4; q++) { this.initializeProjectEffortChart(q); }
      this.updateDashboardData(); // Update other dashboard elements (stats, etc.)
    }
  }

  onDevisChange(event: MatSelectChange) {
    this.selectedDevis = event.value;
    this.projectSelectionService.setSelectedDevis(this.selectedDevis);
    // Load workload details for the selected devis
    if (this.selectedDevis && this.selectedDevis.id) {
      this.workloadDetailService.getByDevisId(this.selectedDevis.id).subscribe({
        next: (details) => {
          this.workloadDetails = details;
          this.groupTasksByMonthAndCalculateWorkload(); // Recalculate after loading devis details
          this.initializeAllCharts(); // Re-initialize charts
        },
        error: (error) => {
          console.error('Error loading workload details for devis:', error);
          this.workloadDetails = []; // Clear on error
          this.groupTasksByMonthAndCalculateWorkload(); // Recalculate with empty devis details
          this.initializeAllCharts();
        }
      });

      // Load invoicing details for the selected devis
      this.invoicingDetailService.getByDevisId(this.selectedDevis.id).subscribe({
        next: (details) => {
          this.invoicingDetails = details;
          console.log('Invoicing details loaded:', this.invoicingDetails);
          this.updateDashboardData(); // Update dashboard data after invoicing details are loaded
        },
        error: (error) => {
          console.error('Error loading invoicing details:', error);
          this.invoicingDetails = []; // Clear on error
          this.updateDashboardData();
        }
      });

    } else {
      this.workloadDetails = []; // Clear if no devis is selected
      this.invoicingDetails = []; // Clear invoicing details if no devis is selected
      this.groupTasksByMonthAndCalculateWorkload(); // Recalculate with empty devis details
      this.initializeAllCharts();
    }
    this.updateDashboardData();
  }

  private loadDevisForProject() {
    if (this.selectedProject?.id) {
      this.devisService.getDevisByProject(this.selectedProject.id).subscribe({
        next: (devis) => {
          this.devisList = devis;

          // Tenter de restaurer le devis sélectionné depuis le service de sélection
          const savedDevis = this.projectSelectionService.getSelectedDevis();
          if (savedDevis) {
            const foundDevis = this.devisList.find(d => d.id === savedDevis.id);
            if (foundDevis) {
              this.selectedDevis = foundDevis;
              this.projectSelectionService.setSelectedDevis(foundDevis); // S'assurer que l'instance est à jour
            } else {
              // Le devis sauvegardé n'est plus dans la liste (ex: filtré par année, ou supprimé)
              this.selectedDevis = null;
              this.projectSelectionService.setSelectedDevis(null);
            }
          } else {
            // Aucun devis n'était sauvegardé, ou la liste est vide
            this.selectedDevis = null;
            this.projectSelectionService.setSelectedDevis(null);
          }

          this.workloadDetails = []; // Effacer les détails de la charge de travail
          this.invoicingDetails = []; // Effacer les détails de facturation
          this.groupTasksByMonthAndCalculateWorkload();
          this.initializeAllCharts();
          this.updateDashboardData();
        },
        error: (error) => {
          console.error('Error loading devis:', error);
          this.devisList = [];
          this.selectedDevis = null;
          this.projectSelectionService.setSelectedDevis(null);
          this.workloadDetails = [];
          this.invoicingDetails = []; // Effacer les détails de facturation en cas d'erreur
          this.groupTasksByMonthAndCalculateWorkload();
          this.initializeAllCharts();
          this.updateDashboardData();
        }
      });
    } else {
      this.devisList = [];
      this.selectedDevis = null;
      this.projectSelectionService.setSelectedDevis(null);
      this.workloadDetails = [];
      this.invoicingDetails = []; // Effacer les détails de facturation si aucun devis n'est sélectionné
      this.groupTasksByMonthAndCalculateWorkload();
      this.initializeAllCharts();
      this.updateDashboardData();
    }
  }

  private loadInitialData() {
    // Charger les utilisateurs
    this.subscription.add(
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.allUsers = users;
          this.updateDashboardData();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
        }
      })
    );

    // Charger les projets
    this.subscription.add(
      this.projectService.getAllProjects().subscribe({
        next: (projects) => {
          this.allProjects = projects;
          this.projects = projects;
          // Extraire les années distinctes
          this.yearsList = Array.from(new Set(projects.map(p => new Date(p.startDate).getFullYear()))).sort((a, b) => b - a);
          // Synchroniser la sélection du projet avec le localStorage
          const savedProject = this.projectSelectionService.getSelectedProject();
          if (savedProject) {
            const found = this.projects.find(p => p.id === savedProject.id);
            if (found) {
              this.selectedProject = found;
              this.projectSelectionService.setSelectedProject(found);
              this.loadDevisForProject(); // Charger les devis pour ce projet
            } else {
              this.selectedProject = null;
              this.projectSelectionService.setSelectedProject(null);
              this.devisList = [];
              this.selectedDevis = null;
              this.workloadDetails = []; // Vider explicitement les détails de la charge de travail ici
              this.invoicingDetails = []; // Clear invoicing details as well
            }
          }
          this.updateDashboardData();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des projets:', error);
        }
      })
    );

    // Charger les équipes
    this.subscription.add(
      this.projectService.getAllTeams().subscribe({
        next: (teams) => {
          this.allTeams = teams;
          this.updateDashboardData();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des équipes:', error);
        }
      })
    );
  }

  private updateDashboardData() {
    let filteredProjects = this.allProjects;
    let filteredTeams = this.allTeams;
    let filteredUsers = this.allUsers;

    if (this.selectedProject) {
      // Filtrer les projets
      filteredProjects = this.allProjects.filter(p => p.id === this.selectedProject?.id);

      // Si un devis est sélectionné, filtrer davantage les données
      if (this.selectedDevis) {
        // Filtrer les équipes liées au projet
        filteredTeams = this.allTeams.filter(team =>
          team.projectIds?.includes(this.selectedProject?.id || 0)
        );

        // Filtrer les utilisateurs des équipes liées
        const teamIds = filteredTeams.map(team => team.id);
        filteredUsers = this.allUsers.filter(user => {
          const teamMember = this.allTeams
            .flatMap(team => team.members)
            .find(member => member.name === `${user.firstname} ${user.lastname}`);

          return teamMember?.teams?.some(teamId => teamIds.includes(teamId)) || false;
        });
      } else {
        // Filtrer les équipes liées au projet
        filteredTeams = this.allTeams.filter(team =>
          team.projectIds?.includes(this.selectedProject?.id || 0)
        );

        // Filtrer les utilisateurs des équipes liées
        const teamIds = filteredTeams.map(team => team.id);
        filteredUsers = this.allUsers.filter(user => {
          const teamMember = this.allTeams
            .flatMap(team => team.members)
            .find(member => member.name === `${user.firstname} ${user.lastname}`);

          return teamMember?.teams?.some(teamId => teamIds.includes(teamId)) || false;
        });
      }
    }

    if (this.selectedYear) {
      filteredProjects = filteredProjects.filter(p => new Date(p.startDate).getFullYear() === this.selectedYear);
      // Réinitialiser la sélection du projet si nécessaire et vider les détails de la charge de travail
      if (this.selectedProject) {
        const projectStillExists = this.projects.some(p => p.id === this.selectedProject?.id);
        if (!projectStillExists) {
          this.selectedProject = null;
          this.projectSelectionService.setSelectedProject(null);
          this.devisList = [];
          this.selectedDevis = null;
          this.workloadDetails = []; // Vider explicitement les détails de la charge de travail ici
          this.invoicingDetails = []; // Clear invoicing details as well
        }
      }
    } else { // Si 'toutes les années' (null) est sélectionné
      this.projects = this.allProjects; // Afficher tous les projets dans le menu déroulant si il devient visible à nouveau
      // Vider explicitement le projet et le devis sélectionnés lorsque le filtre d'année est effacé
      this.selectedProject = null;
      this.projectSelectionService.setSelectedProject(null);
      this.devisList = [];
      this.selectedDevis = null;
      this.workloadDetails = []; // Vider explicitement les détails de la charge de travail ici
      this.invoicingDetails = []; // Clear invoicing details as well
    }

    // Mettre à jour les statistiques
    this.totalMembers = filteredUsers.length;
    this.activeProjects = filteredProjects.filter(p => p.status === Status.EN_COURS).length;
    this.activeTeams = filteredTeams.length;
    this.recentProjects = filteredProjects.slice(0, 5);

    // Mettre à jour les graphiques
    this.initializeProjectStatusChart(filteredProjects);
    this.initializeTeamMembersChart(filteredTeams);
    this.initializeAllCharts();
  }

  private initializeProjectStatusChart(projects: Project[]) {
    const statusCounts: Record<Status, number> = {
      [Status.EN_COURS]: 0,
      [Status.TERMINE]: 0,
      [Status.EN_ATTENTE]: 0,
      [Status.ANNULE]: 0
    };

    // Calculer les pourcentages au lieu des nombres absolus
    const totalProjects = projects.length;
    projects.forEach(project => {
      statusCounts[project.status]++;
    });

    const ctx = document.getElementById('projectStatusChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found');
      return;
    }

    if (this.projectStatusChart) {
      this.projectStatusChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels: ['En Cours', 'Terminé', 'En Attente', 'Annulé'],
        datasets: [{
          data: [
            (statusCounts[Status.EN_COURS] / totalProjects) * 100,
            (statusCounts[Status.TERMINE] / totalProjects) * 100,
            (statusCounts[Status.EN_ATTENTE] / totalProjects) * 100,
            (statusCounts[Status.ANNULE] / totalProjects) * 100
          ],
          backgroundColor: ['#2196F3', '#4CAF50', '#FFC107', '#F44336']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                return `${value.toFixed(1)}%`;
              }
            }
          }
        }
      }
    };

    this.projectStatusChart = new Chart(ctx, config);
  }

  private initializeTeamMembersChart(teams: Team[]) {
    const ctx = document.getElementById('teamMembersChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found');
      return;
    }

    if (this.teamMembersChart) {
      this.teamMembersChart.destroy();
    }

    // Calculer le nombre total de membres et le pourcentage par équipe
    const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);
    const teamData = teams.map(team => ({
      name: team.name,
      memberCount: team.members?.length || 0,
      percentage: totalMembers > 0 ? ((team.members?.length || 0) / totalMembers) * 100 : 0
    }));

    // Trier les équipes par nombre de membres (décroissant)
    teamData.sort((a, b) => b.memberCount - a.memberCount);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: teamData.map(team => team.name),
        datasets: [{
          label: 'Pourcentage de Membres',
          data: teamData.map(team => team.percentage),
          backgroundColor: '#1976d2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Pourcentage (%)'
            },
            ticks: {
              callback: function (value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                return `${value.toFixed(1)}%`;
              }
            }
          }
        }
      }
    };

    this.teamMembersChart = new Chart(ctx, config);
  }

  onTabChange(event: MatTabChangeEvent) {
    // Vous pouvez ajouter ici la logique pour charger les données spécifiques à chaque onglet
    switch (event.index) {
      case 0: // Dashboard
        this.loadInitialData();
        break;
      case 1: // Team Organization
        // Charger les données d'organisation des équipes
        break;
      case 2: // Tasks & Time
        // Charger les données des tâches et du temps
        break;
      case 3: // Workload Estimation
        // Charger les données de charge de travail
        break;
    }
  }

  onYearChange(year: number | null) {
    this.selectedYear = year;
    // Save selected year to service
    this.projectSelectionService.setSelectedYear(year);

    // Filtrer les projets en fonction de l'année sélectionnée
    if (year) {
      this.projects = this.allProjects.filter(project => {
        const projectYear = new Date(project.startDate).getFullYear();
        return projectYear === year;
      });
      // Réinitialiser la sélection du projet si nécessaire et vider les détails de la charge de travail
      if (this.selectedProject) {
        const projectStillExists = this.projects.some(p => p.id === this.selectedProject?.id);
        if (!projectStillExists) {
          this.selectedProject = null;
          this.projectSelectionService.setSelectedProject(null);
          this.devisList = [];
          this.selectedDevis = null;
          this.workloadDetails = []; // Vider explicitement les détails de la charge de travail ici
          this.invoicingDetails = []; // Clear invoicing details as well
        }
      }
    } else { // Si 'toutes les années' (null) est sélectionné
      this.projects = this.allProjects; // Afficher tous les projets dans le menu déroulant si il devient visible à nouveau
      // Vider explicitement le projet et le devis sélectionnés lorsque le filtre d'année est effacé
      this.selectedProject = null;
      this.projectSelectionService.setSelectedProject(null);
      this.devisList = [];
      this.selectedDevis = null;
      this.workloadDetails = []; // Vider explicitement les détails de la charge de travail ici
      this.invoicingDetails = []; // Clear invoicing details as well
    }

    // Filter tasks by the new year and recalculate workload
    this.filterTasksByYear();
    this.groupTasksByMonthAndCalculateWorkload();

    // Re-initialize the monthly workload charts for all quarters
    for (let q = 1; q <= 4; q++) { this.initializeMonthlyWorkloadChart(q); }
    // Re-initialize the effort charts as well
    for (let q = 1; q <= 4; q++) { this.initializeProjectEffortChart(q); }

    // Update other dashboard data that might depend on the year
    this.updateDashboardData();
  }

  private loadProjectData(project: Project) {
    console.log('Loading project data for dashboard:', project);
    if (!project.id) {
      console.error('Project ID is missing for dashboard');
      return;
    }

    // First, load the PSRs for the project
    this.psrService.getByProject(project.id).subscribe({
      next: (psrs: Psr[]) => {
        console.log('PSRs loaded for dashboard:', psrs);
        this.allPsrs = psrs; // Store all PSRs
        if (psrs.length > 0) {
          // Load task trackers for each PSR
          const psrIds = psrs.map(psr => psr.id).filter((id): id is number => id !== undefined);
          this.loadTaskTrackersForPsrs(psrIds);
        } else {
          console.log('No PSRs found for project, clearing task trackers');
          this.taskTrackers = [];
          this.filterTasksByYear();
          // Update workload charts immediately if no tasks
          this.groupTasksByMonthAndCalculateWorkload();
          // Initialize charts after data is processed
          this.initializeAllCharts();
        }
      },
      error: (error) => {
        console.error('Error loading PSRs for dashboard:', error);
        this.taskTrackers = []; // Clear tasks on error
        this.filterTasksByYear();
        this.groupTasksByMonthAndCalculateWorkload();
        // Initialize charts after data is processed
        this.initializeAllCharts();
      }
    });

    // Note: Team members are loaded in loadInitialData, but we might need them here for cost calculations if that becomes necessary later.
    // For now, we will use estimatedMD and workedMD directly as in the image.
  }

  private loadTaskTrackersForPsrs(psrIds: number[]) {
    const allTaskTrackers: TaskTracker[] = [];
    let completedRequests = 0;
    const totalRequests = psrIds.length;

    if (totalRequests === 0) {
      console.log('No PSR IDs to load task trackers for, clearing task trackers');
      this.taskTrackers = [];
      this.filterTasksByYear();
      this.groupTasksByMonthAndCalculateWorkload();
      // Initialize charts after data is processed
      this.initializeAllCharts();
      return;
    }

    psrIds.forEach(psrId => {
      this.taskTrackerService.getByPsr(psrId).subscribe({
        next: (trackers) => {
          console.log(`Task trackers loaded for PSR ${psrId} for dashboard:`, trackers);
          allTaskTrackers.push(...trackers);
          completedRequests++;

          if (completedRequests === totalRequests) {
            console.log('All task trackers loaded for dashboard:', allTaskTrackers);
            this.taskTrackers = allTaskTrackers;
            this.filterTasksByYear();
            this.groupTasksByMonthAndCalculateWorkload();
            // Initialize charts after data is processed
            this.initializeAllCharts();
          }
        },
        error: (error: any) => {
          console.error(`Error loading task trackers for PSR ${psrId} for dashboard:`, error);
          completedRequests++;

          if (completedRequests === totalRequests) {
            console.log('Finished loading task trackers with errors for dashboard. Proceeding with available data.');
            this.taskTrackers = allTaskTrackers;
            this.filterTasksByYear();
            this.groupTasksByMonthAndCalculateWorkload();
            // Initialize charts after data is processed
            this.initializeAllCharts();
          }
        }
      });
    });
  }

  private filterTasksByYear() {
    console.log('Filtering dashboard tasks by year:', this.selectedYear);
    if (!this.selectedYear) {
      // If no year is selected, use all loaded task trackers
      // This case might be handled differently based on desired behavior when 'all years' is selected.
      // For now, let's assume we only show data for a selected year or clear data if none selected.
      this.taskTrackers = []; // Clear if no year is selected to avoid showing data from all years combined
      this.invoicingDetails = []; // Clear invoicing details if year filter is active and no project/devis is selected
      return;
    }

    // We already filtered by year when loading PSRs based on project start date.
    // However, a project can span multiple years, and task trackers might be recorded in different years.
    // Let's refilter based on task tracker startDate for accuracy.
    this.taskTrackers = this.taskTrackers.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate.getFullYear() === this.selectedYear;
    });
    console.log('Filtered dashboard tasks:', this.taskTrackers);
  }

  private groupTasksByMonthAndCalculateWorkload() {
    console.log('Grouping dashboard tasks by month and calculating workload');
    this.groupedMonthlyWorkload = {};

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    // Initialize with effective workload from task trackers
    this.taskTrackers.forEach(task => {
      const date = new Date(task.startDate);
      const monthIndex = date.getMonth(); // 0-indexed month
      const month = monthNames[monthIndex];

      if (!this.groupedMonthlyWorkload[month]) {
        this.groupedMonthlyWorkload[month] = { planned: 0, effective: 0 };
      }
      this.groupedMonthlyWorkload[month].effective += task.workedMD || 0;
    });

    // Overlay planned workload from devis workload details
    this.workloadDetails.forEach(detail => {
      const [monthFromPeriod] = this.parsePeriod(detail.period);
      if (monthNames.includes(monthFromPeriod)) { // Ensure it's a valid month name
        if (!this.groupedMonthlyWorkload[monthFromPeriod]) {
          this.groupedMonthlyWorkload[monthFromPeriod] = { planned: 0, effective: 0 };
        }
        this.groupedMonthlyWorkload[monthFromPeriod].planned += detail.totalEstimatedWorkload || 0;
      }
    });

    // Calculate cumulative workload based on monthly totals
    const accurateCumulativeWorkload: { [month: string]: { planned: number, effective: number } } = {};
    let cumulativePlanned = 0;
    let cumulativeEffective = 0;

    monthNames.forEach(month => {
      // Add the monthly workload to the cumulative total
      cumulativePlanned += this.groupedMonthlyWorkload[month]?.planned || 0;
      cumulativeEffective += this.groupedMonthlyWorkload[month]?.effective || 0;

      // Store the cumulative values for the current month
      accurateCumulativeWorkload[month] = { planned: cumulativePlanned, effective: cumulativeEffective };
    });

    console.log('Grouped monthly workload for dashboard:', this.groupedMonthlyWorkload);
    // Store the cumulative workload data in a property
    this.cumulativeMonthlyWorkload = accurateCumulativeWorkload;
    console.log('Cumulative monthly workload for dashboard:', this.cumulativeMonthlyWorkload);
  }

  // Method to initialize monthly workload chart for a given quarter
  private initializeMonthlyWorkloadChart(quarter: number) {
    console.log(`Initializing monthly workload chart for Quarter ${quarter}`);
    const ctx = document.getElementById(`workloadChartQ${quarter}`) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`Canvas element for workloadChartQ${quarter} not found`);
      return;
    }

    // Define months for the given quarter
    const quarterMonths: { [key: number]: string[] } = {
      1: ["January", "February", "March"],
      2: ["April", "May", "June"],
      3: ["July", "August", "September"],
      4: ["October", "November", "December"]
    };
    const months = quarterMonths[quarter];

    // Extract data for the months in this quarter
    const plannedData = months.map(month => this.groupedMonthlyWorkload[month]?.planned || 0);
    const effectiveData = months.map(month => this.groupedMonthlyWorkload[month]?.effective || 0);

    // Destroy existing chart if it exists (assuming chart instances are stored)
    // We need to manage chart instances to destroy them before creating new ones.
    // Let's add an array to hold chart instances.
    // For simplicity now, let's just create the chart.
    if (this.workloadCharts[quarter - 1]) {
      this.workloadCharts[quarter - 1]?.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: months,
        datasets: [
          {
            label: 'Planned Workload',
            data: plannedData,
            backgroundColor: '#2196F3', // Blue
          },
          {
            label: 'Effective Workload',
            data: effectiveData,
            backgroundColor: '#F44336', // Red
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Workload (MD)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.raw !== null) {
                  label += context.raw + ' MD';
                }
                return label;
              }
            }
          }
        }
      }
    };

    // Create the new chart
    // Store chart instances to destroy them later
    // Need to add properties for each chart instance, e.g., workloadChartQ1, workloadChartQ2, etc.
    // For simplicity now, let's just create the chart.
    this.workloadCharts[quarter - 1] = new Chart(ctx, config);
  }

  // Placeholder method for Project Effort Progress chart (to be implemented later if needed)
  private initializeProjectEffortChart(quarter: number) {
    console.log(`Initializing Project Effort Progress chart for Quarter ${quarter}`);
    const ctx = document.getElementById(`effortChartQ${quarter}`) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`Canvas element for effortChartQ${quarter} not found`);
      return;
    }

    // Define months for the given quarter
    const quarterMonths: { [key: number]: string[] } = {
      1: ["January", "February", "March"],
      2: ["April", "May", "June"],
      3: ["July", "August", "September"],
      4: ["October", "November", "December"]
    };
    const months = quarterMonths[quarter];

    // Extract cumulative data for the months in this quarter
    const cumulativePlannedData = months.map(month => this.cumulativeMonthlyWorkload[month]?.planned || 0);
    const cumulativeEffectiveData = months.map(month => this.cumulativeMonthlyWorkload[month]?.effective || 0);

    // Destroy existing chart if it exists
    if (this.effortCharts[quarter - 1]) {
      this.effortCharts[quarter - 1]?.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: months,
        datasets: [
          {
            label: 'Planned Workload',
            data: cumulativePlannedData,
            borderColor: '#2196F3', // Blue
            backgroundColor: 'rgba(33, 150, 243, 0.2)', // Light blue fill
            fill: false,
            tension: 0.1
          },
          {
            label: 'Effective Workload',
            data: cumulativeEffectiveData,
            borderColor: '#F44336', // Red
            backgroundColor: 'rgba(244, 67, 54, 0.2)', // Light red fill
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cumulative Workload (MD)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.raw !== null) {
                  label += context.raw + ' MD';
                }
                return label;
              }
            }
          }
        }
      }
    };

    // Create the new chart and store the instance
    this.effortCharts[quarter - 1] = new Chart(ctx, config);
  }

  // Nouvelle méthode pour initialiser tous les graphiques
  private initializeAllCharts() {
    // Initialize workload charts for all quarters
    for (let q = 1; q <= 4; q++) {
      this.initializeMonthlyWorkloadChart(q);
    }
    // Initialize effort charts for all quarters
    for (let q = 1; q <= 4; q++) {
      this.initializeProjectEffortChart(q);
    }
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

    for (const [key, value] of Object.entries(monthMapping) as [string, string][]) {
      if (cleanedPeriod.includes(key)) {
        return [value, null];
      }
    }
    const currentMonth = this.months[new Date().getMonth()];
    return [currentMonth, null];
  }

  async exportDashboard(): Promise<void> {
    console.log('Exporting dashboard...');
    console.log('Current this.taskTrackers content at export:', this.taskTrackers); // Added for debugging

    const workbook = new ExcelJS.Workbook();

    // Consolidated Declarations and Helper Functions for exportDashboard
    interface EnrichedTaskTracker extends TaskTracker {
      dailyCost: number;
      plannedCost: number;
      effectiveCost: number;
      remainingCost: number;
      holidaysFormatted: string;
    }

    const matchMonthYear = (month1: string | undefined | null, year1: number, month2: string | undefined | null, year2: string): boolean => {
      const safeMonth1 = (month1 || '').toLowerCase();
      const safeMonth2 = (month2 || '').toLowerCase();
      const parsedYear2 = year2 ? parseInt(year2) : NaN;

      return safeMonth1 === safeMonth2 && year1 === parsedYear2;
    };

    const getPlannedWorkloadForMonth = (monthYear: string): number => {
      const [month, year] = monthYear.split(' ');
      return this.workloadDetails
        ?.filter((w: WorkloadDetail) => {
          const [detailMonth] = this.parsePeriod(w.period); // Use this.parsePeriod
          return matchMonthYear(
            detailMonth,
            parseInt(year),
            month,
            year
          );
        })
        ?.reduce((sum: number, w: WorkloadDetail) => sum + (w.totalEstimatedWorkload || 0), 0) || 0;
    };

    const getPlannedCostForMonth = (monthYear: string): number => {
      if (!this.selectedDevis) return 0;

      const [month] = monthYear.split(' '); // Extract month name from 'Month Year' string

      // Find the invoicing detail for the given month
      const invoicingDetail = this.invoicingDetails.find(d => {
        const invoicingMonth = new Date(d.invoicingDate).toLocaleString('en-US', { month: 'long' });
        return invoicingMonth === month; // Match month names
      });

      return invoicingDetail?.amount || 0;
    };

    // Helper function to get estimated workload per resource for a specific task's month
    const getEstimatedWorkloadPerResourceForTaskInExport = (task: TaskTracker): number => {
      if (!this.workloadDetails || !task?.startDate) return 0;

      const taskDate = new Date(task.startDate);
      const taskMonthName = taskDate.toLocaleString('en-US', { month: 'long' });
      const taskYearNum = taskDate.getFullYear();

      const correspondingWorkloadDetail = this.workloadDetails.find(wd => {
        const [wdMonth, wdYear] = this.parsePeriod(wd.period);
        return wdMonth === taskMonthName && wdYear === taskYearNum;
      });

      return correspondingWorkloadDetail?.estimatedWorkload || 0;
    };

    const memberMap = new Map(
      this.allTeams.flatMap(team =>
        team.members.map(member => [member.initial?.toLowerCase(), member])
      )
    );

    const enrichedTasks = (this.taskTrackers || []).map((task: TaskTracker): EnrichedTaskTracker => {
      const member = memberMap.get(task.who?.toLowerCase());
      const dailyCost = member?.cost || 0;
      const taskStartDate = new Date(task.startDate);
      const taskMonth = taskStartDate.getMonth();
      const taskYear = taskStartDate.getFullYear();

      const holidaysFormatted = (member?.holiday || [])
        .filter(holidayDateString => {
          const [holidayDatePart] = holidayDateString.split('|');
          const holidayDate = new Date(holidayDatePart);
          return holidayDate.getMonth() === taskMonth && holidayDate.getFullYear() === taskYear;
        })
        .map(h => h.split('|')[0])
        .join('\n');

      const plannedWorkloadTask = getEstimatedWorkloadPerResourceForTaskInExport(task);
      const effectiveWorkloadTask = task.workedMD || 0;

      const plannedCostTask = plannedWorkloadTask * dailyCost;
      const effectiveCostTask = effectiveWorkloadTask * dailyCost;

      return {
        ...task,
        dailyCost,
        plannedCost: plannedCostTask,
        effectiveCost: effectiveCostTask,
        remainingMD: plannedWorkloadTask - effectiveWorkloadTask,
        remainingCost: plannedCostTask - effectiveCostTask,
        holidaysFormatted
      };
    });

    // Fonction pour forcer le fond blanc sur toute une feuille
    const setWhiteBackground = (sheet: ExcelJS.Worksheet) => {
      sheet.properties.showGridLines = false;
      // Applique un style blanc à toute la feuille (zone raisonnable)
      for (let r = 1; r <= 500; r++) {
        for (let c = 1; c <= 100; c++) {
          const cell = sheet.getCell(r, c);
          if (!cell.fill) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
          }
        }
      }
    };
    // Define common styles (moved to top)
    const baseCellStyle = {
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFFFFF' } }, // blanc
      font: { name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const }
    };

    const headerStyle = {
      font: { bold: true, color: { argb: 'FF800000' } }, // Red text
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFA6A6A6' } },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const, wrapText: true }
    };

    const subHeaderStyle = {
      font: { bold: true, color: { argb: 'FF000000' } }, // Black
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFC5D9F1' } }, // Light Blue
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const }
    };

    const monthStyle = {
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFC5D9F1' } },
      alignment: { vertical: 'middle' as const, pattern: 'solid' as const, horizontal: 'center' as const }
    };

    const totalStyle = {
      font: { bold: true, color: { argb: 'FF800000' } }, // Red
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFC5D9F1' } },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const }
    };

    const dataCellStyle = {
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      fill: { type: "pattern" as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFFFFF' } } // Fixed: argb value was missing one F
    };

    // 2. Style rouge pour les titres
    const redStyle = {
      font: {
        color: { argb: 'FF800000' }, // Rouge
        bold: true
      },
      // Removed fill property to allow combining with other background styles
    };
    // New helper function to apply styles (moved to top)
    const applyStyles = (cell: ExcelJS.Cell, style: any) => {
      cell.font = { ...baseCellStyle.font, ...style.font };
      cell.fill = style.fill || baseCellStyle.fill;
      cell.alignment = style.alignment || baseCellStyle.alignment;
      cell.border = style.border || {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    };

    // New helper function to add the common header block to any sheet
    const addHeaderBlockToSheet = async (sheet: ExcelJS.Worksheet, projectId: string, currentYear: number) => {
      // Disable grid lines for the entire sheet
      sheet.properties.showGridLines = false;
      //logo Telnet
      // Définir les dimensions et bordures de la zone
      sheet.mergeCells('B2:B5');

      for (let r = 2; r <= 5; r++) {
        sheet.getCell(`B${r}`).border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
        sheet.getRow(r).height = 30; // Ajuste la hauteur pour faire rentrer l'image
      }

      sheet.getColumn('B').width = 20; // Ajuste la largeur

      // Charger l'image
      const response = await fetch('assets/logo_telnet.png');
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      const imageId = workbook.addImage({
        buffer,
        extension: 'png'
      });

      // Insérer l'image dans la même zone
      sheet.addImage(imageId, {
        tl: { col: 1.05, row: 1.1 }, // Ajusté pour B2
        ext: { width: 90, height: 80 } // Ajuste selon la taille exacte du bloc B2:B5
      });


      // Titre principal "Dashboard for 'Project Name'"
      sheet.mergeCells('C2:K5');
      const titleCell = sheet.getCell('F2');
      titleCell.value = `Dashboard for '${projectId}'`;
      titleCell.font = { size: 18, bold: true, color: { argb: 'FF000000' } }; // Black text
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Bloc d'informations (Ref, Edition, Date, Author)
      const infoRows = ['Ref:', 'Edition:', 'Date:', 'Author:'];
      infoRows.forEach((label, i) => {
        const rowIndex = 2 + i;

        // Label cell (L column)
        const labelCell = sheet.getCell(`L${rowIndex}`);
        labelCell.value = label;
        labelCell.font = { bold: true };
        labelCell.alignment = { vertical: 'middle', horizontal: 'left' };
        labelCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Value cell (M column)
        const valueCell = sheet.getCell(`M${rowIndex}`);
        if (label === 'Date:') {
          valueCell.value = new Date().toLocaleDateString('fr-FR');
        } else {
          valueCell.value = '';
        }
        valueCell.alignment = { vertical: 'middle', horizontal: 'left' };
        valueCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Set row height (optional for visual clarity)
        sheet.getRow(rowIndex).height = 20;
      });



      // Extend the header block border to rows 2-6 and columns 2-13 for a larger border effect
      for (let r = 2; r <= 5; r++) {
        for (let c = 2; c <= 13; c++) {
          const cell = sheet.getCell(r, c);
          cell.border = {
            top: { style: 'medium' },    // Thicker border
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
      }

      // Largeurs des colonnes
      sheet.columns = [
        { key: 'A', width: 2 },  // Colonne vide
        { key: 'B', width: 15 }, // Colonne pour TELNET
        { key: 'C', width: 5 },
        { key: 'D', width: 5 },
        { key: 'E', width: 5 },
        { key: 'F', width: 25 }, // Colonne pour le titre
        { key: 'G', width: 5 },
        { key: 'H', width: 5 },
        { key: 'I', width: 5 },
        { key: 'J', width: 5 },
        { key: 'K', width: 5 },
        { key: 'L', width: 10 }, // Colonne pour les labels (Ref, Edition...)
        { key: 'M', width: 15 }  // Colonne pour les valeurs
      ];

      // Hauteur des lignes
      for (let r = 2; r <= 6; r++) {
        sheet.getRow(r).height = 20;
      }
    };

    // New helper function to draw the Monthly Workload and Project Effort Progress sections for a quarter
    const drawQuarterChartsSection = (
      sheet: ExcelJS.Worksheet,
      quarterNum: number,
      startRow: number,
      startCol: number,
      months: string[],
      groupedWorkload: { [month: string]: { planned: number, effective: number } },
      cumulativeWorkload: { [month: string]: { planned: number, effective: number } }
    ) => {
      // Styles specific to these charts
      const chartTitleStyle = {
        font: { bold: true, size: 12 },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }, // Light Grey
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      const chartHeaderStyle = {
        font: { bold: true },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } }, // Light Blue
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      const chartMonthStyle = {
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      const chartDataStyle = {
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      const chartTotalStyle = {
        font: { bold: true },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }, // Slightly darker grey
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      // --- Monthly Workload Section ---
      const monthlyWorkloadStartCol = startCol;
      const monthlyWorkloadTitleRow = startRow;
      const monthlyWorkloadHeaderRow = startRow + 1;
      let monthlyWorkloadDataStartRow = startRow + 2;

      sheet.mergeCells(monthlyWorkloadTitleRow, monthlyWorkloadStartCol, monthlyWorkloadTitleRow, monthlyWorkloadStartCol + 2);
      Object.assign(sheet.getCell(monthlyWorkloadTitleRow, monthlyWorkloadStartCol), chartTitleStyle).value = `Q${quarterNum} Year - Monthly Workload`;

      Object.assign(sheet.getCell(monthlyWorkloadHeaderRow, monthlyWorkloadStartCol), chartHeaderStyle).value = 'Month';
      Object.assign(sheet.getCell(monthlyWorkloadHeaderRow, monthlyWorkloadStartCol + 1), chartHeaderStyle).value = 'Planned (MD)';
      Object.assign(sheet.getCell(monthlyWorkloadHeaderRow, monthlyWorkloadStartCol + 2), chartHeaderStyle).value = 'Effective (MD)';

      let totalPlannedMonthly = 0;
      let totalEffectiveMonthly = 0;

      months.forEach(month => {
        const planned = groupedWorkload[month]?.planned || 0;
        const effective = groupedWorkload[month]?.effective || 0;

        Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol), chartMonthStyle).value = month;
        Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol + 1), chartDataStyle).value = planned;
        Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol + 2), chartDataStyle).value = effective;

        totalPlannedMonthly += planned;
        totalEffectiveMonthly += effective;
        monthlyWorkloadDataStartRow++;
      });

      // Monthly Workload Total Row
      Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol), chartTotalStyle).value = 'Total';
      Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol + 1), chartTotalStyle).value = totalPlannedMonthly;
      Object.assign(sheet.getCell(monthlyWorkloadDataStartRow, monthlyWorkloadStartCol + 2), chartTotalStyle).value = totalEffectiveMonthly;

      // Set column widths for Monthly Workload
      sheet.getColumn(monthlyWorkloadStartCol).width = 15;
      sheet.getColumn(monthlyWorkloadStartCol + 1).width = 15;
      sheet.getColumn(monthlyWorkloadStartCol + 2).width = 15;

      // --- Project Effort Progress Section ---
      const effortProgressStartCol = startCol + 5; // Assuming 3 columns + 2 for spacing
      const effortProgressTitleRow = startRow;
      const effortProgressHeaderRow = startRow + 1;
      let effortProgressDataStartRow = startRow + 2;

      sheet.mergeCells(effortProgressTitleRow, effortProgressStartCol, effortProgressTitleRow, effortProgressStartCol + 2);
      Object.assign(sheet.getCell(effortProgressTitleRow, effortProgressStartCol), chartTitleStyle).value = `Q${quarterNum} Year - Project Effort Progress`;

      Object.assign(sheet.getCell(effortProgressHeaderRow, effortProgressStartCol), chartHeaderStyle).value = 'Month';
      Object.assign(sheet.getCell(effortProgressHeaderRow, effortProgressStartCol + 1), chartHeaderStyle).value = 'Cumulative Planned (MD)';
      Object.assign(sheet.getCell(effortProgressHeaderRow, effortProgressStartCol + 2), chartHeaderStyle).value = 'Cumulative Effective (MD)';

      let totalPlannedCumulative = 0;
      let totalEffectiveCumulative = 0;

      months.forEach(month => {
        const planned = cumulativeWorkload[month]?.planned || 0;
        const effective = cumulativeWorkload[month]?.effective || 0;

        Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol), chartMonthStyle).value = month;
        Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol + 1), chartDataStyle).value = planned;
        Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol + 2), chartDataStyle).value = effective;

        totalPlannedCumulative = planned; // cumulative sum already calculated
        totalEffectiveCumulative = effective; // cumulative sum already calculated
        effortProgressDataStartRow++;
      });

      // Project Effort Progress Total Row (last cumulative values)
      Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol), chartTotalStyle).value = 'Total';
      Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol + 1), chartTotalStyle).value = totalPlannedCumulative;
      Object.assign(sheet.getCell(effortProgressDataStartRow, effortProgressStartCol + 2), chartTotalStyle).value = totalEffectiveCumulative;

      // Set column widths for Project Effort Progress
      sheet.getColumn(effortProgressStartCol).width = 18;
      sheet.getColumn(effortProgressStartCol + 1).width = 25;
      sheet.getColumn(effortProgressStartCol + 2).width = 25;

      // Ensure all cells in the quarter block have borders
      const maxRow = Math.max(monthlyWorkloadDataStartRow, effortProgressDataStartRow);
      for (let r = startRow; r <= maxRow; r++) {
        for (let c = monthlyWorkloadStartCol; c <= effortProgressStartCol + 2; c++) {
          const cell = sheet.getCell(r, c);
          if (!cell.border || Object.keys(cell.border).length === 0) { // Only apply if no specific border is set
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        }
      }
    };

    // --- 1. Dashboard Summary Sheet ---
    const dashboardSummarySheet = workbook.addWorksheet('Dashboard');
    setWhiteBackground(dashboardSummarySheet);

    // Set page setup properties for printing
    dashboardSummarySheet.pageSetup = {
      paperSize: 9, // A4 paper (ExcelJS enum for A4)
      orientation: 'landscape', // Landscape orientation
      fitToPage: true, // Fit content to one page
      fitToWidth: 1, // Fit to 1 page wide
      fitToHeight: 0, // No limit on height (or specify a number if needed)
      printArea: 'B2:K103' // Define the exact print area
    };

    const projectIdForHeader = this.selectedProject?.name || 'Project Name';
    const currentYearForHeader = this.selectedYear || new Date().getFullYear();
    await addHeaderBlockToSheet(dashboardSummarySheet, projectIdForHeader, currentYearForHeader);

    // Define start rows for each quarter section (title + charts) based on image
    const q1TitleRow = 7;
    const q1ChartsStartRow = 8; // Charts start here

    const chartHeightInRows = 23; // From image, chart spans ~23 rows

    const q2TitleRow = q1ChartsStartRow + chartHeightInRows + 1; // After Q1 charts + 2 blank rows (approx)
    const q2ChartsStartRow = q2TitleRow + 1;

    const q3TitleRow = q2ChartsStartRow + chartHeightInRows + 1;
    const q3ChartsStartRow = q3TitleRow + 1;

    const q4TitleRow = q3ChartsStartRow + chartHeightInRows + 1;
    const q4ChartsStartRow = q4TitleRow + 1;

    const quarterSections = [
      { quarter: 1, titleRow: q1TitleRow, chartsStartRow: q1ChartsStartRow },
      { quarter: 2, titleRow: q2TitleRow, chartsStartRow: q2ChartsStartRow },
      { quarter: 3, titleRow: q3TitleRow, chartsStartRow: q3ChartsStartRow },
      { quarter: 4, titleRow: q4TitleRow, chartsStartRow: q4ChartsStartRow },
    ];

    // Columns for charts based on image: Chart 1 (B-F), Chart 2 (G-K)
    const chart1ExcelColStart = 2; // B
    const chart1ExcelColEnd = 6;   // F
    const chart2ExcelColStart = 7; // G
    const chart2ExcelColEnd = 11;  // K

    // Set generous column widths to accommodate charts (from B to K)
    for (let colIdx = chart1ExcelColStart; colIdx <= chart2ExcelColEnd; colIdx++) {
      dashboardSummarySheet.getColumn(colIdx).width = 36; // Adjusted width based on visual appearance
    }

    for (const section of quarterSections) {
      // Add Quarter Title
      // Merge across the entire chart area (B to K)
      dashboardSummarySheet.mergeCells(section.titleRow, chart1ExcelColStart, section.titleRow, chart2ExcelColEnd);
      const titleCell = dashboardSummarySheet.getCell(section.titleRow, chart1ExcelColStart);
      titleCell.value = `Quarter ${section.quarter} year`;
      titleCell.font = { bold: true, size: 16, color: { argb: 'FF1E5A99' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF5' } }; // Light grey background for title
      titleCell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };

      // Embed Workload Chart (Excel columns B-F)
      const workloadChart = this.workloadCharts[section.quarter - 1];
      if (workloadChart) {
        const workloadImageId = workbook.addImage({
          base64: workloadChart.toBase64Image(),
          extension: 'png',
        });
        dashboardSummarySheet.addImage(workloadImageId, {
          tl: { col: chart1ExcelColStart - 1, row: section.chartsStartRow - 1 }, // tl is 0-indexed
          ext: { width: 550, height: 300 }
        });
      }

      // Embed Effort Chart (Excel columns G-K)
      const effortChart = this.effortCharts[section.quarter - 1];
      if (effortChart) {
        const effortImageId = workbook.addImage({
          base64: effortChart.toBase64Image(),
          extension: 'png',
        });
        dashboardSummarySheet.addImage(effortImageId, {
          tl: { col: chart2ExcelColStart - 1, row: section.chartsStartRow - 1 }, // tl is 0-indexed
          ext: { width: 500, height: 300 }
        });
      }
      for (let i = 2; i <= 11; i++) {
        dashboardSummarySheet.getColumn(i).width = 15;
      }

      // Set row heights for visual consistency (title row + chart area)
      dashboardSummarySheet.getRow(section.titleRow).height = 25; // Height for the title row
      // Set height for all rows that the chart image spans (approximated from 250px height)
      // Based on image, chart spans from row 8 to 30, which is 23 rows.
      // Set height for each of these rows for consistent appearance.
      for (let r = section.chartsStartRow; r < section.chartsStartRow + chartHeightInRows; r++) {
        dashboardSummarySheet.getRow(r).height = 13; // Approx 9px per row to span 23 rows for 250px image
      }

      // Add blank rows for spacing after the charts, before the next quarter title
      if (section.quarter < 4) {
        for (let r = section.chartsStartRow + chartHeightInRows; r < section.chartsStartRow + chartHeightInRows + 2; r++) {
          dashboardSummarySheet.getRow(r).height = 15; // 2 blank rows for spacing (row 31, 32 for Q1)
        }
      }
    }

    // End of Dashboard Summary Sheet
    // Auto-filter is not relevant for a sheet with embedded charts, so removed.
    // Removed old Dashboard Summary logic

    // --- 2. Team Organization Sheet ---
    const teamOrgaSheet = workbook.addWorksheet('Team Organization');
    setWhiteBackground(teamOrgaSheet);
    await addHeaderBlockToSheet(teamOrgaSheet, projectIdForHeader, currentYearForHeader);

    const teamOrgaTitleRow = 7; // Adjusted to start after header block
    const teamOrgaHeadersRow = 9; // Adjusted to start after title

    // "Team Organization" title
    teamOrgaSheet.mergeCells(`B${teamOrgaTitleRow}:M${teamOrgaTitleRow}`);
    const teamOrgaTitleCell = teamOrgaSheet.getCell(`B${teamOrgaTitleRow}`);
    teamOrgaTitleCell.value = 'Team Organization';
    teamOrgaTitleCell.font = { bold: true, size: 14, color: { argb: 'FF333399' } }; // Black font
    teamOrgaTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }; // Light Green
    teamOrgaTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    teamOrgaTitleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Table Headers
    const teamOrgaHeaders = [
      { header: '', key: 'emptyA', width: 3 }, // Re-added for column A
      { header: '#', key: 'idx', width: 5 },
      { header: 'Initial', key: 'initial', width: 14 },
      { header: 'Member', key: 'memberName', width: 18 },
      { header: 'Role', key: 'role', width: 14 },
      { header: 'Project', key: 'project', width: 18 },
      { header: 'Planned Start Date', key: 'plannedStartDate', width: 14 },
      { header: 'Planned End Date', key: 'plannedEndDate', width: 14 },
      { header: 'Allocation (%)', key: 'allocation', width: 12 },
      { header: 'Coming From Team', key: 'comingFromTeam', width: 12 },
      { header: 'Going To Team', key: 'goingToTeam', width: 12 },
      { header: 'Holiday', key: 'holiday', width: 18 },
      { header: 'Note', key: 'note', width: 20 }
    ];

    teamOrgaSheet.columns = teamOrgaHeaders.map(h => ({
      key: h.key,
      width: h.width
    }));

    const headerRow = teamOrgaSheet.getRow(teamOrgaHeadersRow);
    headerRow.values = teamOrgaHeaders.map(h => h.header);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FF000000' } }; // Black text
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } }; // Light Blue
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data Rows - Only include members from selected devis
    let currentTeamMemberIndex = 1;
    let teamOrgaCurrentRowNumber = teamOrgaHeadersRow + 1;

    if (this.selectedDevis && this.selectedDevis.demandeId) {
      // Find the demande associated with the selected devis
      const relatedDemande = this.selectedProject?.demandes?.find(d => d.id === this.selectedDevis?.demandeId);

      if (relatedDemande) {
        const memberIdsInDemande = new Set(relatedDemande.teamMemberIds || []);
        const fakeMemberNamesInDemande = new Set((relatedDemande.fakeMembers || []).map(fm => fm.name));

        // Filter teams to only include members from the selected demande
        this.allTeams.forEach(team => {
          const filteredMembers = team.members?.filter(member => {
            const isRealMember = member.id && memberIdsInDemande.has(member.id);
            const isFakeMember = fakeMemberNamesInDemande.has(member.name);
            return isRealMember || isFakeMember;
          });

          filteredMembers?.forEach(member => {
            const row = teamOrgaSheet.getRow(teamOrgaCurrentRowNumber++);

            let allocation = 0;

            if (this.selectedProject?.id && member.allocationByTeamId) {
              const teamAllocation = member.allocationByTeamId[this.selectedProject.id];
              if (teamAllocation && typeof teamAllocation.value === 'number') {
                allocation = teamAllocation.value;
              } else {
                allocation = member.allocation ?? 0;
              }
            } else {
              allocation = member.allocation ?? 0;
            }


            row.values = [
              '', // Column A empty - Re-added to align with B start
              currentTeamMemberIndex++,
              member.initial || '',
              member.name,
              member.role || member.jobTitle || 'N/A',
              this.selectedProject?.name || 'All Projects',
              // Use dates from the related Demande for Planned Start Date and Planned End Date
              relatedDemande.dateDebut ? new Date(relatedDemande.dateDebut).toLocaleDateString() : '',
              relatedDemande.dateFin ? new Date(relatedDemande.dateFin).toLocaleDateString() : '',
              allocation * 100 + '%', // Format allocation as percentage
              '',
              '',
              (member.holiday || []).map(h => h.split('|')[0]).join('\n'), // Changed to \n for new line
              '',
            ];

            const comingFromTeamColIndex = teamOrgaHeaders.findIndex(h => h.key === 'Coming From Team');
            const goingToTeamColIndex = teamOrgaHeaders.findIndex(h => h.key === 'Going To Team');
            const holidayColIndex = teamOrgaHeaders.findIndex(h => h.key === 'Holiday');

            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
              cell.alignment = { vertical: 'middle', horizontal: 'center' };

              // Apply grey background to 'Coming From Team' and 'Going To Team' columns
              // Note: colNumber is 1-indexed, array index is 0-indexed
              if (colNumber - 1 === comingFromTeamColIndex || colNumber - 1 === goingToTeamColIndex) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }; // Light Grey
              }
              // Ensure wrapText is true for the holiday column
              if (colNumber - 1 === holidayColIndex) {
                cell.alignment = { ...cell.alignment, wrapText: true };
              }
            });
          });
        });
      }
    }


    // --- 3. Tasks & Timesheets Sheet ---
    const tasksTimeSheet = workbook.addWorksheet('Tasks & Timesheets');
    setWhiteBackground(tasksTimeSheet);
    await addHeaderBlockToSheet(tasksTimeSheet, projectIdForHeader, currentYearForHeader);

    const tasksTimeTopHeadersRow = 7; // Main categories (Year, Effective, Planned, Remaining, etc.)
    const tasksTimeSubHeadersRow = 8; // Sub-headers (Workload, Cost, etc.)
    const tasksTimeDataStartRow = 9; // Data starts from this row
    let tasksTimeCurrentRowNumber = tasksTimeDataStartRow;

    // Define styles for this sheet
    const tasksHeaderStyle = {
      font: { bold: true, color: { argb: 'FF800000' } }, // Rouge bordeaux
      fill: { type: "pattern", pattern: 'solid', fgColor: { argb: 'FF808080' } }, // Grey
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const monthlySummaryStyle = {
      font: { bold: true, color: { argb: 'FF000000' } }, // Black
      fill: { type: "pattern", pattern: 'solid', fgColor: { argb: 'FF92D050' } }, // Green
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const taskDataStyle = {
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Set column widths from B to O to match the image
    tasksTimeSheet.getColumn('A').width = 2; // Keep A small/empty
    tasksTimeSheet.getColumn('B').width = 10; // Year column - for vertical text
    tasksTimeSheet.getColumn('C').width = 10; // Owner
    tasksTimeSheet.getColumn('D').width = 15; // Summary
    tasksTimeSheet.getColumn('E').width = 20; // Daily Cost (Euro)
    tasksTimeSheet.getColumn('F').width = 18; // Effective Workload (M/D)
    tasksTimeSheet.getColumn('G').width = 18; // Effective Cost (Euro)
    tasksTimeSheet.getColumn('H').width = 18; // Planned Workload (M/D)
    tasksTimeSheet.getColumn('I').width = 18; // Planned Cost (Euro)
    tasksTimeSheet.getColumn('J').width = 18; // Remaining Workload (M/D)
    tasksTimeSheet.getColumn('K').width = 18; // Remaining Cost (Euro)
    tasksTimeSheet.getColumn('L').width = 15; // Start Date
    tasksTimeSheet.getColumn('M').width = 15; // End Date
    tasksTimeSheet.getColumn('N').width = 30; // Holidays
    tasksTimeSheet.getColumn('O').width = 30; // Note

    // Apply common header style
    const applyTasksHeaderStyle = (cell: ExcelJS.Cell) => {
      Object.assign(cell, tasksHeaderStyle);
    };

    // Merge and set values for Top Headers (Year, Owner, Summary, Daily Cost, Start Date, End Date, Holidays, Note)
    // These span two rows (tasksTimeTopHeadersRow and tasksTimeSubHeadersRow)
    const twoRowHeaders = [
      { col: 2, value: 'Year' },
      { col: 3, value: 'Owner' },
      { col: 4, value: 'Summary' },
      { col: 5, value: 'Daily Cost (Euro)' },
      { col: 12, value: 'Start Date' },
      { col: 13, value: 'End Date' },
      { col: 14, value: 'Holidays' },
      { col: 15, value: 'Note' }
    ];

    twoRowHeaders.forEach(h => {
      tasksTimeSheet.mergeCells(tasksTimeTopHeadersRow, h.col, tasksTimeSubHeadersRow, h.col);
      const cell = tasksTimeSheet.getCell(tasksTimeTopHeadersRow, h.col);
      cell.value = h.value;
      applyTasksHeaderStyle(cell);
    });

    // Merge and set values for main categories (Effective, Planned, Remaining) on Top Header Row
    tasksTimeSheet.mergeCells(tasksTimeTopHeadersRow, 6, tasksTimeTopHeadersRow, 7); // Effective: F to G
    const effectiveHeaderCell = tasksTimeSheet.getCell(tasksTimeTopHeadersRow, 6);
    effectiveHeaderCell.value = 'Effective';
    applyTasksHeaderStyle(effectiveHeaderCell);

    tasksTimeSheet.mergeCells(tasksTimeTopHeadersRow, 8, tasksTimeTopHeadersRow, 9); // Planned: H to I
    const plannedHeaderCell = tasksTimeSheet.getCell(tasksTimeTopHeadersRow, 8);
    plannedHeaderCell.value = 'Planned';
    applyTasksHeaderStyle(plannedHeaderCell);

    tasksTimeSheet.mergeCells(tasksTimeTopHeadersRow, 10, tasksTimeTopHeadersRow, 11); // Remaining: J to K
    const remainingHeaderCell = tasksTimeSheet.getCell(tasksTimeTopHeadersRow, 10);
    remainingHeaderCell.value = 'Remaining';
    applyTasksHeaderStyle(remainingHeaderCell);

    // Set values for Sub-Headers on Sub-Header Row
    const subHeaderMapping = [
      { col: 6, value: 'Effective Workload (M/D)' },
      { col: 7, value: 'Effective Cost (Euro)' },
      { col: 8, value: 'Planned Workload (M/D)' },
      { col: 9, value: 'Planned Cost (Euro)' },
      { col: 10, value: 'Remaining Workload (M/D)' },
      { col: 11, value: 'Remaining Cost (Euro)' }
    ];

    subHeaderMapping.forEach(item => {
      const cell = tasksTimeSheet.getCell(tasksTimeSubHeadersRow, item.col);
      cell.value = item.value;
      applyTasksHeaderStyle(cell);
    });

    // Group tasks by year and then by month
    const groupedTasksByYear: { [year: string]: { [month: string]: EnrichedTaskTracker[] } } = {};
    const allYearsInTasks = Array.from(new Set(this.taskTrackers.map(t => new Date(t.startDate).getFullYear()))).sort();
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    allYearsInTasks.forEach(year => {
      groupedTasksByYear[year] = {};
      allMonths.forEach(month => {
        groupedTasksByYear[year][month] = [];
      });
    });

    enrichedTasks.forEach((task: EnrichedTaskTracker) => {
      if (task.startDate) {
        const date = new Date(task.startDate);
        const year = date.getFullYear().toString();
        const month = date.toLocaleString('en-US', { month: 'long' });
        if (groupedTasksByYear[year] && groupedTasksByYear[year][month]) {
          groupedTasksByYear[year][month].push(task);
        }
      }
    });

    let currentRow = tasksTimeDataStartRow; // Start data rows from here

    Object.keys(groupedTasksByYear).sort().forEach(year => {
      const yearStartRow = currentRow; // Mark the start row for this year

      // Iterate through months for the current year
      allMonths.forEach(month => {
        const tasksInMonth = groupedTasksByYear[year][month];
        let totalEffectiveWorkload = 0;
        let totalEffectiveCost = 0;
        let totalRemainingWorkload = 0;
        let totalRemainingCost = 0;

        tasksInMonth.forEach((task: EnrichedTaskTracker) => {
          totalEffectiveWorkload += task.workedMD || 0;
          totalEffectiveCost += task.effectiveCost || 0;
          totalRemainingWorkload += task.remainingMD || 0;
          totalRemainingCost += task.remainingCost || 0;
        });

        const monthYearString = `${month} ${year}`;
        const totalPlannedWorkload = getPlannedWorkloadForMonth(monthYearString);
        const totalPlannedCost = getPlannedCostForMonth(monthYearString);

        // Monthly Summary Row (Green)
        const summaryRow = tasksTimeSheet.getRow(currentRow++);
        summaryRow.height = 20;
        summaryRow.outlineLevel = 0; // Ensure summary row is at base level

        // Month name in column C, data shifted right to align with headers C-O
        Object.assign(summaryRow.getCell(3), monthlySummaryStyle).value = month; // Month name in column C
        Object.assign(summaryRow.getCell(6), monthlySummaryStyle).value = totalEffectiveWorkload;
        Object.assign(summaryRow.getCell(7), monthlySummaryStyle).value = parseFloat(totalEffectiveCost.toFixed(2));
        Object.assign(summaryRow.getCell(8), monthlySummaryStyle).value = totalPlannedWorkload;
        Object.assign(summaryRow.getCell(9), monthlySummaryStyle).value = parseFloat(totalPlannedCost.toFixed(2));
        Object.assign(summaryRow.getCell(10), monthlySummaryStyle).value = totalRemainingWorkload;
        Object.assign(summaryRow.getCell(11), monthlySummaryStyle).value = parseFloat(totalRemainingCost.toFixed(2));

        // Apply monthlySummaryStyle to all cells in the summary row and merge month name cells
        for (let col = 3; col <= 15; col++) { // Adjusted loop to column O (index 15)
          Object.assign(summaryRow.getCell(col), monthlySummaryStyle);
        }
        tasksTimeSheet.mergeCells(summaryRow.number, 3, summaryRow.number, 5); // Merge month name cells C-E

        // Add task rows
        tasksInMonth.forEach(task => {
          const dataRow = tasksTimeSheet.getRow(currentRow++);
          dataRow.height = 20;
          dataRow.outlineLevel = 1; // Set outline level to 1 for task rows

          // Find the workload detail for the current task's month and year
          const taskStartDate = new Date(task.startDate);
          const taskMonthName = taskStartDate.toLocaleString('en-US', { month: 'long' });
          const taskYearNum = taskStartDate.getFullYear();

          const correspondingWorkloadDetail = this.workloadDetails.find(wd => {
            const [wdMonth] = this.parsePeriod(wd.period);
            // Assuming workloadDetail.period format is "Month Year" or similar that parsePeriod handles
            return wdMonth === taskMonthName && wd.period.includes(taskYearNum.toString());
          });

          const estimatedWorkloadPerResource = correspondingWorkloadDetail?.estimatedWorkload || 0;

          // Data for columns C to O
          Object.assign(dataRow.getCell(3), taskDataStyle).value = task.who || ''; // Owner in column C
          Object.assign(dataRow.getCell(4), taskDataStyle).value = task.description || '';
          Object.assign(dataRow.getCell(5), taskDataStyle).value = task.dailyCost ?? '-';
          Object.assign(dataRow.getCell(6), taskDataStyle).value = task.workedMD || 0;
          Object.assign(dataRow.getCell(7), taskDataStyle).value = task.effectiveCost ?? 0;
          Object.assign(dataRow.getCell(8), taskDataStyle).value = getEstimatedWorkloadPerResourceForTaskInExport(task) || 0;
          Object.assign(dataRow.getCell(9), taskDataStyle).value = parseFloat(task.plannedCost.toFixed(2));
          Object.assign(dataRow.getCell(10), taskDataStyle).value = parseFloat(task.remainingMD.toFixed(2));
          Object.assign(dataRow.getCell(11), taskDataStyle).value = parseFloat(task.remainingCost.toFixed(2));
          Object.assign(dataRow.getCell(12), taskDataStyle).value = task.startDate ? new Date(task.startDate).toLocaleDateString() : '';
          Object.assign(dataRow.getCell(13), taskDataStyle).value = task.effectiveEndDate ? new Date(task.effectiveEndDate).toLocaleDateString() : 'N/A';
          Object.assign(dataRow.getCell(14), taskDataStyle).value = task.holidaysFormatted || '-';
          Object.assign(dataRow.getCell(15), taskDataStyle).value = task.note || '-';

          // Apply borders
          for (let col = 3; col <= 15; col++) { // Adjusted loop to column O (index 15)
            const cell = dataRow.getCell(col);
            Object.assign(cell, taskDataStyle);
            if (col === 14) { // Holidays column (N)
              cell.alignment = { ...cell.alignment, wrapText: true };
            }
          }
        });
      });

      // After all months for the year, merge the year cell
      const yearCell = tasksTimeSheet.getCell(yearStartRow, 2); // Column B (index 2) for Year
      tasksTimeSheet.mergeCells(yearStartRow, 2, currentRow - 1, 2);
      Object.assign(yearCell, {
        font: { bold: true, color: { argb: 'FF800000' } }, // Red font
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: 'FFA6A6A6' } }, // Grey background
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true, textRotation: 90 }, // Vertical text
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }).value = year; // Set the year value
    });

    // Auto-filter - adjusted range to include new Year column and shifted content
    if (currentRow > tasksTimeDataStartRow) {
      tasksTimeSheet.autoFilter = { from: 'B' + tasksTimeSubHeadersRow, to: 'O' + (currentRow - 1) }; // Adjusted filter range to column O
    }

    // --- 4. Planned Workload Sheet (Custom Design) ---
    const plannedWorkloadSheet = workbook.addWorksheet('Planned Workload');
    setWhiteBackground(plannedWorkloadSheet);

    // Configuration spécifique pour le format de la capture
    plannedWorkloadSheet.properties.defaultColWidth = 15; // Largeur par défaut des colonnes
    plannedWorkloadSheet.properties.showGridLines = false; // Désactive les lignes de grille

    // Ajustement des largeurs de colonnes
    plannedWorkloadSheet.getColumn(1).width = 2;  // A
    plannedWorkloadSheet.getColumn(2).width = 2;  // B
    plannedWorkloadSheet.getColumn(3).width = 20; // C
    plannedWorkloadSheet.getColumn(4).width = 30; // D
    plannedWorkloadSheet.getColumn(5).width = 20; // E
    plannedWorkloadSheet.getColumn(6).width = 30; // F
    plannedWorkloadSheet.getColumn(7).width = 5;  // G (espace)
    plannedWorkloadSheet.getColumn(8).width = 15; // H
    plannedWorkloadSheet.getColumn(9).width = 20; // I
    plannedWorkloadSheet.getColumn(10).width = 15; // J
    plannedWorkloadSheet.getColumn(11).width = 20; // K
    // Espacement vertical
    plannedWorkloadSheet.getRow(6).height = 15;
    plannedWorkloadSheet.getRow(13).height = 15;
    plannedWorkloadSheet.getRow(7).height = 35;
    plannedWorkloadSheet.getRow(14).height = 5;

    // Espacement entre les blocs de quartiers
    plannedWorkloadSheet.getRow(6).height = 15; // Espace avant Q1
    plannedWorkloadSheet.getRow(13).height = 15; // Espace entre Q1 et Q2
    plannedWorkloadSheet.getRow(20).height = 15; // Espace entre Q2 et Q3
    plannedWorkloadSheet.getRow(27).height = 15; // Espace entre Q3 et Q4

    // Hauteur des lignes pour les en-têtes
    plannedWorkloadSheet.getRow(7).height = 25; // Ligne Q1 Year
    plannedWorkloadSheet.getRow(14).height = 25; // Ligne Q2 Year
    plannedWorkloadSheet.getRow(21).height = 25; // Ligne Q3 Year
    plannedWorkloadSheet.getRow(28).height = 25; // Ligne Q4 Year

    // Hauteur des lignes
    [7, 14, 21, 28].forEach(row => plannedWorkloadSheet.getRow(row).height = 25); // En-têtes
    [8, 9, 10, 15, 16, 17, 22, 23, 24, 29, 30, 31].forEach(row => plannedWorkloadSheet.getRow(row).height = 20); // Données
    [11, 18, 25, 32].forEach(row => plannedWorkloadSheet.getRow(row).height = 25); // Totaux

    await addHeaderBlockToSheet(plannedWorkloadSheet, projectIdForHeader, currentYearForHeader);


    // Helper to draw a quarter block
    const drawQuarter = (startRow: number, startCol: number, quarterNum: number, months: string[], allWorkloadDetails: WorkloadDetail[], currentYear: number) => {
      // First, aggressively unmerge the entire potential block area
      plannedWorkloadSheet.unMergeCells(startRow, startCol, startRow + 5, startCol + 3); // Max rows for a quarter block is 6 (startRow to startRow+5)

      const colMap: { [key: string]: number } = {
        'Estimated workload per Resource (Man/day)': startCol + 1,
        'Number of resources': startCol + 2,
        'Estimated total workload (Man/day)': startCol + 3
      };

      // Qx Year Header
      plannedWorkloadSheet.mergeCells(startRow, startCol, startRow + 1, startCol);
      const qHeaderCell = plannedWorkloadSheet.getCell(startRow, startCol);
      qHeaderCell.value = `Q${quarterNum} ${currentYear}`; // Dynamic year
      applyStyles(qHeaderCell, headerStyle); // Use headerStyle for grey background and red text

      // Proposal file name_Qx Year
      plannedWorkloadSheet.mergeCells(startRow, startCol + 1, startRow, startCol + 3);
      const proposalCell = plannedWorkloadSheet.getCell(startRow, startCol + 1);
      proposalCell.value = `${this.selectedDevis?.reference || 'Proposal file name'}_Q${quarterNum} ${currentYear}`; // Dynamic year
      applyStyles(proposalCell, headerStyle); // Use headerStyle for grey background and red text

      // Headers for data
      plannedWorkloadSheet.getRow(startRow + 1).height = 70; // Increased height for header row to allow better wrapping
      plannedWorkloadSheet.getCell(startRow + 1, startCol).value = '';
      applyStyles(plannedWorkloadSheet.getCell(startRow + 1, startCol), headerStyle);

      // Ajoute "Qx Year" dans la cellule vide à gauche (déjà fusionnée verticalement sur 2 lignes)
      const qYearCell = plannedWorkloadSheet.getCell(startRow, startCol);
      qYearCell.value = `Q${quarterNum} Year`;
      applyStyles(qYearCell, {
        font: { bold: true, color: { argb: 'FF800000' } }, // Rouge bordeaux
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: 'FFA6A6A6' } }, // Même bleu que les mois
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      });

      plannedWorkloadSheet.getCell(startRow + 1, colMap['Estimated workload per Resource (Man/day)']).value = 'Estimated workload per Resource (Man/day)';
      applyStyles(plannedWorkloadSheet.getCell(startRow + 1, colMap['Estimated workload per Resource (Man/day)']), headerStyle);

      plannedWorkloadSheet.getCell(startRow + 1, colMap['Number of resources']).value = 'Number of resources';
      applyStyles(plannedWorkloadSheet.getCell(startRow + 1, colMap['Number of resources']), headerStyle);

      plannedWorkloadSheet.getCell(startRow + 1, colMap['Estimated total workload (Man/day)']).value = 'Estimated total workload (Man/day)';
      applyStyles(plannedWorkloadSheet.getCell(startRow + 1, colMap['Estimated total workload (Man/day)']), headerStyle);

      let totalWorkloadQuarter = 0;

      // Months and Data
      months.forEach((month, index) => {
        const rowNum = startRow + 2 + index;
        plannedWorkloadSheet.getCell(rowNum, startCol).value = month;
        applyStyles(plannedWorkloadSheet.getCell(rowNum, startCol), monthStyle);

        // Find the workload detail for the current month and year
        const workloadDetail = allWorkloadDetails.find(wd => {
          const [wdMonth, wdYear] = this.parsePeriod(wd.period);
          return wdMonth === month && wdYear === currentYear;
        });

        const estimatedWorkloadPerResource = workloadDetail?.estimatedWorkload || 0;
        const numberOfResources = workloadDetail?.numberOfResources || 0;
        const totalEstimatedWorkloadForMonth = workloadDetail?.totalEstimatedWorkload || 0;

        plannedWorkloadSheet.getCell(rowNum, colMap['Estimated workload per Resource (Man/day)']).value = estimatedWorkloadPerResource;
        applyStyles(plannedWorkloadSheet.getCell(rowNum, colMap['Estimated workload per Resource (Man/day)']), dataCellStyle);

        plannedWorkloadSheet.getCell(rowNum, colMap['Number of resources']).value = numberOfResources;
        applyStyles(plannedWorkloadSheet.getCell(rowNum, colMap['Number of resources']), dataCellStyle);

        plannedWorkloadSheet.getCell(rowNum, colMap['Estimated total workload (Man/day)']).value = totalEstimatedWorkloadForMonth;
        applyStyles(plannedWorkloadSheet.getCell(rowNum, colMap['Estimated total workload (Man/day)']), dataCellStyle);
        totalWorkloadQuarter += totalEstimatedWorkloadForMonth;
      });

      // Ligne du total visuel (ex : ligne 20 pour Q2)
      const totalRow = startRow + 2 + months.length;
      const labelCell = plannedWorkloadSheet.getCell(totalRow, startCol);
      labelCell.value = `Total Q${quarterNum} ${currentYear} (Man/day)`;
      labelCell.font = { bold: true, color: { argb: 'FF000000' } };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5D9F1' } };
      labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

      // Fusionner les 3 colonnes de droite pour la valeur (D→F ou I→K)
      plannedWorkloadSheet.mergeCells(totalRow, startCol + 1, totalRow, startCol + 3);
      const totalValueMergedCell = plannedWorkloadSheet.getCell(totalRow, startCol + 1);
      totalValueMergedCell.value = totalWorkloadQuarter;
      totalValueMergedCell.font = { bold: true, color: { argb: 'FF000000' } };
      totalValueMergedCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5D9F1' } };
      totalValueMergedCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Appliquer bordures sur toute la ligne de total
      for (let col = startCol; col <= startCol + 3; col++) {
        const cell = plannedWorkloadSheet.getCell(totalRow, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      const totalValueCell = plannedWorkloadSheet.getCell(totalRow, startCol + 3);
      totalValueCell.value = totalWorkloadQuarter;
      // Apply totalStyle first to get font, alignment, and border, then override fill to white
      applyStyles(totalValueCell, totalStyle);
      totalValueCell.fill = dataCellStyle.fill;

      // Set column widths for this block
      plannedWorkloadSheet.getColumn(startCol).width = 20;
      plannedWorkloadSheet.getColumn(startCol + 1).width = 50; // Increased width again for readability
      plannedWorkloadSheet.getColumn(startCol + 2).width = 30;
      plannedWorkloadSheet.getColumn(startCol + 3).width = 35;

      // Add borders for the entire quarter block
      for (let r = startRow; r <= totalRow; r++) {
        for (let c = startCol; c <= startCol + 3; c++) {
          const cell = plannedWorkloadSheet.getCell(r, c);
          if (!cell.border) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        }
      }
    };
    // Retrieve workload details and call drawQuarter
    if (this.selectedDevis && this.selectedDevis.id) {
      this.workloadDetailService.getByDevisId(this.selectedDevis.id).subscribe({
        next: (details: WorkloadDetail[]) => {
          this.workloadDetails = details;
          // Draw all quarters - Adjusted start rows for Q2 and Q4 to avoid merge conflicts
          drawQuarter(7, 3, 1, ["January", "February", "March"], this.workloadDetails, currentYearForHeader); // Start at row 7 for Q1
          drawQuarter(7, 10, 3, ["July", "August", "September"], this.workloadDetails, currentYearForHeader); // Start at row 7 for Q3
          drawQuarter(14, 3, 2, ["April", "May", "June"], this.workloadDetails, currentYearForHeader); // Start at row 14 for Q2
          drawQuarter(14, 10, 4, ["October", "November", "December"], this.workloadDetails, currentYearForHeader); // Start at row 14 for Q4

          // Generate Excel file and trigger download after all sheets are drawn
          const fileName = `Dashboard_Export_${this.selectedProject?.name || 'Overall'}_${currentYearForHeader}_${new Date().toISOString().split('T')[0]}.xlsx`;
          try {
            workbook.xlsx.writeBuffer().then((buffer) => {
              const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              FileSaver.saveAs(blob, fileName);
            });
            console.log('Dashboard exported successfully!');
          } catch (error) {
            console.error('Error exporting dashboard:', error);
          }
        },
        error: (error: any) => {
          console.error('Error loading workload details for export:', error);
          // Fallback if workload details cannot be loaded
          // Draw quarters with empty data if there's an error
          drawQuarter(7, 3, 1, ['January', 'February', 'March'], this.workloadDetails, currentYearForHeader); // Start at row 7 for Q1
          drawQuarter(7, 8, 3, ['July', 'August', 'September'], this.workloadDetails, currentYearForHeader); // Start at row 7 for Q3

          drawQuarter(14, 3, 2, ['April', 'May', 'June'], this.workloadDetails, currentYearForHeader); // Start at row 14 for Q2
          drawQuarter(14, 8, 4, ['October', 'November', 'December'], this.workloadDetails, currentYearForHeader); // Start at row 14 for Q4


          // Still attempt to save the workbook even if workload data is empty
          const fileName = `Dashboard_Export_${this.selectedProject?.name || 'Overall'}_${currentYearForHeader}_${new Date().toISOString().split('T')[0]}.xlsx`;
          try {
            workbook.xlsx.writeBuffer().then((buffer) => {
              const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              FileSaver.saveAs(blob, fileName);
            });
            console.log('Dashboard exported (with missing workload data)!');
          } catch (err) {
            console.error('Error exporting dashboard after workload data load failure:', err);
          }
        }
      });
    } else {
      console.warn('No selected Devis for workload export, workload data will be empty.');
      // Draw quarters with empty data if no Devis is selected
      drawQuarter(7, 3, 1, ["January", "February", "March"], [], currentYearForHeader); // Start at row 7 for Q1
      drawQuarter(7, 8, 3, ["July", "August", "September"], [], currentYearForHeader); // Start at row 14 for Q3
      drawQuarter(14, 3, 2, ["April", "May", "June"], [], currentYearForHeader); // Start at row 14 for Q2
      drawQuarter(14, 8, 4, ["October", "November", "December"], [], currentYearForHeader); // Start at row 14 for Q4

      // Still attempt to save the workbook even if workload data is empty
      const fileName = `Dashboard_Export_${this.selectedProject?.name || 'Overall'}_${currentYearForHeader}_${new Date().toISOString().split('T')[0]}.xlsx`;
      try {
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(blob, fileName);
        });
        console.log('Dashboard exported (with empty workload data)!');
      } catch (err) {
        console.error('Error exporting dashboard without devis:', err);
      }
    }
  }
}

