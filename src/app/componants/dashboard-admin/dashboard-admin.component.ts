import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { Project, Status } from '../../model/project.model';
import { User } from '../../model/user.model';
import { Team } from '../../model/Team.model';
import { Subscription } from 'rxjs';

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
  
  private projectStatusChart: Chart | null = null;
  private teamMembersChart: Chart | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.projectStatusChart) {
      this.projectStatusChart.destroy();
    }
    if (this.teamMembersChart) {
      this.teamMembersChart.destroy();
    }
  }

  private loadInitialData() {
    // Charger les utilisateurs
    this.subscription.add(
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.totalMembers = users.length;
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
          this.activeProjects = projects.filter(p => p.status === Status.EN_COURS).length;
          this.recentProjects = projects.slice(0, 5); // Prendre les 5 derniers projets
          this.initializeProjectStatusChart(projects);
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
          this.activeTeams = teams.length;
          this.initializeTeamMembersChart(teams);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des équipes:', error);
        }
      })
    );
  }

  private initializeProjectStatusChart(projects: Project[]) {
    const statusCounts: Record<Status, number> = {
      [Status.EN_COURS]: 0,
      [Status.TERMINE]: 0,
      [Status.EN_ATTENTE]: 0,
      [Status.ANNULE]: 0
    };

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
            statusCounts[Status.EN_COURS],
            statusCounts[Status.TERMINE],
            statusCounts[Status.EN_ATTENTE],
            statusCounts[Status.ANNULE]
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

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: teams.map(team => team.name),
        datasets: [{
          label: 'Nombre de Membres',
          data: teams.map(team => team.members?.length || 0),
          backgroundColor: '#1976d2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    this.teamMembersChart = new Chart(ctx, config);
  }
}
