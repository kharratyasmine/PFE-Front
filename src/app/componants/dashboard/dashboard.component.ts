import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/model/project.model';
import { ProjectTask } from 'src/app/model/ProjectTask.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { TaskService } from 'src/app/services/project-task.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  
    totalProjects: number = 0;
    totalMembers: number = 0;
    totalTasksInProgress: number = 0;
    totalTasksDone: number = 0;
    latestActivities: string[] = [];
  
    projects: Project[] = [];
    members: TeamMember[] = [];
    tasks: ProjectTask[] = [];
  
    constructor(
      private projectService: ProjectService,
      private memberService: TeamMemberService,
      private taskService: TaskService
    ) {}
  
    ngOnInit(): void {
      this.loadDashboardData();
    }
  
    loadDashboardData(): void {
      // Récupérer les projets
      this.projectService.getAllProjects().subscribe((projects) => {
        this.projects = projects;
        this.totalProjects = projects.length;
        // Ici, vous pouvez créer des activités récentes à partir des projets
      });
  
      // Récupérer les membres
      this.memberService.getAllTeamMembers().subscribe((members) => {
        this.members = members;
        this.totalMembers = members.length;
      });
  
      // Récupérer les tâches et calculer les indicateurs
      this.taskService.getTasks().subscribe((tasks) => {
        this.tasks = tasks;
        this.totalTasksInProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        this.totalTasksDone = tasks.filter(t => t.status === 'DONE').length;
  
        // Exemple d'activités récentes : vous pouvez adapter selon vos besoins
        this.latestActivities = tasks.slice(0, 3).map(task => 
          `Tâche "${task.name}" (${task.status}) – Projet ID ${task.projectId}`
        );
      });
    }
  }
  