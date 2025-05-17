import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Project, Status } from 'src/app/model/project.model';
import { ProjectTask, TaskStatus } from 'src/app/model/ProjectTask.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { TaskService } from 'src/app/services/project-task.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { Chart, ChartType, ChartTypeRegistry, DoughnutController, registerables } from 'chart.js';
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

// Enregistrer tous les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  
    totalProjects: number = 0;
    totalMembers: number = 0;
    totalTasksInProgress: number = 0;
    totalTasksDone: number = 0;
    latestActivities: string[] = [];
  
    projects: Project[] = [];
    members: TeamMember[] = [];
    tasks: ProjectTask[] = [];

    // Objets Chart - type any pour éviter les erreurs de typage
    projectStatusChart: any;
    taskCompletionChart: any;
    projectTimelineChart: any;
    tasksByProjectChart: any;
    teamWorkloadChart: any;
    
    // Indique si les données sont chargées
    dataLoaded: boolean = false;
  
    constructor(
      private projectService: ProjectService,
      private memberService: TeamMemberService,
      private taskService: TaskService
    ) {}
  
    ngOnInit(): void {
      this.loadDashboardData();
    }

    ngAfterViewInit(): void {
      // Vérifier si les données sont déjà chargées, sinon attendre qu'elles le soient
      if (this.dataLoaded) {
        this.initCharts();
      }
    }
  
    loadDashboardData(): void {
      // Compteurs pour suivre les chargements asynchrones
      let loadedItems = 0;
      const totalItems = 3; // projets, membres, tâches
      
      const checkAllLoaded = () => {
        loadedItems++;
        if (loadedItems === totalItems) {
          this.dataLoaded = true;
          this.initCharts();
        }
      };

      // Récupérer les projets
      this.projectService.getAllProjects().subscribe((projects) => {
        this.projects = projects;
        this.totalProjects = projects.length;
        // Ici, vous pouvez créer des activités récentes à partir des projets
        checkAllLoaded();
      });
  
      // Récupérer les membres
      this.memberService.getAllTeamMembers().subscribe((members) => {
        this.members = members;
        this.totalMembers = members.length;
        checkAllLoaded();
      });
  
      // Récupérer les tâches et calculer les indicateurs
      this.taskService.getTasks().subscribe((tasks) => {
        this.tasks = tasks;
        this.totalTasksInProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        this.totalTasksDone = tasks.filter(t => t.status === TaskStatus.DONE).length;
  
        // Exemple d'activités récentes : vous pouvez adapter selon vos besoins
        this.latestActivities = tasks.slice(0, 5).map(task => 
          `Tâche "${task.name}" (${task.status}) – Projet ID ${task.projectId}`
        );
        checkAllLoaded();
      });
    }

    /**
     * Initialise tous les graphiques du tableau de bord
     */
    initCharts(): void {
      this.initProjectStatusChart();
      this.initTaskCompletionChart();
      this.initProjectTimelineChart();
      this.initTasksByProjectChart();
      this.initTeamWorkloadChart();
    }

    /**
     * Helper pour créer un graphique en évitant les problèmes de typage
     */
    createChart(canvasId: string, type: ChartType, data: any, options: any = { responsive: true }): any {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) return null;
      
      return new Chart(canvas, {
        type,
        data,
        options
      } as any);
    }

    /**
     * Crée un graphique en secteurs pour la répartition des statuts de projets
     */
    initProjectStatusChart(): void {
      // Compter les projets par statut
      const statusCounts = {
        'EN_COURS': 0,
        'TERMINE': 0,
        'EN_ATTENTE': 0,
        'ANNULE': 0
      };

      this.projects.forEach(project => {
        if (statusCounts.hasOwnProperty(project.status)) {
          statusCounts[project.status as keyof typeof statusCounts]++;
        }
      });

      const data = {
        labels: ['En cours', 'Terminé', 'En attente', 'Annulé'],
        datasets: [{
          data: [
            statusCounts['EN_COURS'],
            statusCounts['TERMINE'],
            statusCounts['EN_ATTENTE'],
            statusCounts['ANNULE']
          ],
          backgroundColor: [
            '#ffc107', // Jaune/warning pour En cours
            '#198754', // Vert/success pour Terminé
            '#0dcaf0', // Bleu/info pour En attente
            '#dc3545'  // Rouge/danger pour Annulé
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      };

      const options = {
        responsive: true,
        cutout: '65%'
      };

      this.projectStatusChart = this.createChart('projectStatusChart', 'doughnut', data, options);
    }

    /**
     * Crée un graphique en barres pour la complétion des tâches
     */
    initTaskCompletionChart(): void {
      // Compter les tâches par statut
      const taskCounts = {
        'TODO': 0,
        'IN_PROGRESS': 0,
        'DONE': 0,
        'BLOCKED': 0
      };

      this.tasks.forEach(task => {
        if (taskCounts.hasOwnProperty(task.status)) {
          taskCounts[task.status as keyof typeof taskCounts]++;
        }
      });

      const data = {
        labels: ['À faire', 'En cours', 'Terminé', 'Bloqué'],
        datasets: [{
          label: 'Nombre de tâches',
          data: [
            taskCounts['TODO'],
            taskCounts['IN_PROGRESS'],
            taskCounts['DONE'],
            taskCounts['BLOCKED']
          ],
          backgroundColor: [
            'rgba(108, 117, 125, 0.7)', // Gris pour À faire
            'rgba(255, 193, 7, 0.7)',    // Jaune pour En cours
            'rgba(25, 135, 84, 0.7)',    // Vert pour Terminé
            'rgba(220, 53, 69, 0.7)'     // Rouge pour Bloqué
          ],
          borderColor: [
            'rgb(108, 117, 125)',
            'rgb(255, 193, 7)',
            'rgb(25, 135, 84)',
            'rgb(220, 53, 69)'
          ],
          borderWidth: 1
        }]
      };

      const options = {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      };

      this.taskCompletionChart = this.createChart('taskCompletionChart', 'bar', data, options);
    }

    /**
     * Crée un graphique pour visualiser les tâches par projet
     */
    initTasksByProjectChart(): void {
      // Compter les tâches par projet
      const tasksByProject: { [projectId: number]: number } = {};
      const projectNames: { [projectId: number]: string } = {};

      // Obtenir les noms des projets
      this.projects.forEach(project => {
        if (project.id) {
          projectNames[project.id] = project.name;
          tasksByProject[project.id] = 0;
        }
      });

      // Compter les tâches pour chaque projet
      this.tasks.forEach(task => {
        if (task.projectId && tasksByProject.hasOwnProperty(task.projectId)) {
          tasksByProject[task.projectId]++;
        }
      });

      // Obtenir les 5 projets avec le plus de tâches
      const topProjects = Object.entries(tasksByProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const labels = topProjects.map(([projectId]) => 
        projectNames[Number(projectId)] || `Projet ${projectId}`
      );
      const data = topProjects.map(([_, count]) => count);

      const chartData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(13, 110, 253, 0.7)',  // Bleu
            'rgba(25, 135, 84, 0.7)',   // Vert 
            'rgba(255, 193, 7, 0.7)',   // Jaune
            'rgba(13, 202, 240, 0.7)',  // Cyan
            'rgba(111, 66, 193, 0.7)'   // Violet
          ],
          borderWidth: 0
        }]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: {
                size: 10
              }
            }
          }
        }
      };

      this.tasksByProjectChart = this.createChart('tasksByProjectChart', 'polarArea', chartData, options);
    }

    /**
     * Crée un graphique pour visualiser la charge de travail de l'équipe
     */
    initTeamWorkloadChart(): void {
      // Simuler la répartition des tâches par membre (normalement, cela serait basé sur les données réelles)
      const teamWorkload: { [memberId: number]: number } = {};
      const memberNames: { [memberId: number]: string } = {};

      // Obtenir les noms des membres
      this.members.forEach(member => {
        if (member.id) {
          memberNames[member.id] = member.name;
          teamWorkload[member.id] = 0;
        }
      });

      // Simuler l'attribution des tâches (dans un projet réel, cette donnée proviendrait du backend)
      // Pour l'instant, nous allons distribuer les tâches aléatoirement
      this.tasks.forEach(task => {
        if (task.assignments && task.assignments.length > 0) {
          // Si la tâche a des attributions réelles
          task.assignments.forEach(assignment => {
            if (assignment.teamMemberId && teamWorkload.hasOwnProperty(assignment.teamMemberId)) {
              teamWorkload[assignment.teamMemberId]++;
            }
          });
        } else {
          // Sinon, attribuer aléatoirement à un membre
          const memberIds = Object.keys(teamWorkload);
          if (memberIds.length > 0) {
            const randomMemberId = Number(memberIds[Math.floor(Math.random() * memberIds.length)]);
            teamWorkload[randomMemberId]++;
          }
        }
      });

      // Obtenir les 5 membres avec le plus de tâches
      const topMembers = Object.entries(teamWorkload)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const labels = topMembers.map(([memberId]) => 
        memberNames[Number(memberId)] || `Membre ${memberId}`
      );
      const data = topMembers.map(([_, count]) => count);

      const chartData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(13, 110, 253, 0.7)',  // Bleu
            'rgba(25, 135, 84, 0.7)',   // Vert
            'rgba(255, 193, 7, 0.7)',   // Jaune
            'rgba(220, 53, 69, 0.7)',   // Rouge
            'rgba(111, 66, 193, 0.7)'   // Violet
          ],
          borderWidth: 0,
          hoverOffset: 15
        }]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((acc: number, val: number) => acc + val, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} tâches (${percentage}%)`;
              }
            }
          }
        }
      };

      this.teamWorkloadChart = this.createChart('teamWorkloadChart', 'pie', chartData, options);
    }

    /**
     * Crée un graphique en ligne pour la progression des projets dans le temps
     */
    initProjectTimelineChart(): void {
      // Prendre les 5 projets les plus récents pour le graphique
      const recentProjects = [...this.projects]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5);

      const data = {
        labels: recentProjects.map(p => p.name),
        datasets: [{
          label: 'Date de début',
          data: recentProjects.map(p => new Date(p.startDate).getTime()),
          borderColor: 'rgba(13, 110, 253, 0.7)',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: 'rgba(13, 110, 253, 1)',
          pointRadius: 4
        }, {
          label: 'Date de fin',
          data: recentProjects.map(p => new Date(p.endDate).getTime()),
          borderColor: 'rgba(25, 135, 84, 0.7)',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: 'rgba(25, 135, 84, 1)',
          pointRadius: 4
        }]
      };

      const options = {
        responsive: true,
        scales: {
          y: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM yyyy'
              }
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Projets'
            }
          }
        }
      };

      this.projectTimelineChart = this.createChart('projectTimelineChart', 'line', data, options);
    }
  }
  