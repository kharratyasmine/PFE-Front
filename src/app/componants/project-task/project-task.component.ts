import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectGroup } from 'src/app/model/project-group.model';
import { ProjectTask, TaskStatus } from 'src/app/model/ProjectTask.model';
import { TaskService } from 'src/app/services/project-task.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-project-task',
  templateUrl: './project-task.component.html',
  styleUrls: ['./project-task.component.css']
})
export class ProjectTaskComponent implements OnInit {
  projectId: number | null = null;
 // ✅ ajouté
  projects: any[] = [];
  filteredMembers: any[] = [];
  itemsPerPage: number = 3;
  selectedTask: ProjectTask = this.createEmptyTask();
  isEditMode = false;
  groupedTasks: ProjectGroup[] = [];
  


  statusList = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.BLOCKED
  ];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private teamMemberService: TeamMemberService
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => { // ✅ Utiliser route.parent.params
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;
  
      if (this.projectId && !isNaN(this.projectId)) {
        this.loadCurrentProjectTasks();
        this.loadMembersByProject(this.projectId);
      } else {
        console.error('❌ projectId invalide ou absent dans l’URL', idParam);
      }
    });
  }
  
  

  loadCurrentProjectTasks(): void {
    this.projectService.getProjectById(this.projectId!).subscribe(proj => {
      this.projects = [proj];
      this.groupedTasks = [{
        projectId: proj.id ?? null, // ✅ Correction explicite (id ou null)
        projectName: proj.name,
        tasks: [],
        filteredTasks: [],
        currentPage: 1
      }];
  
      this.taskService.getTasksByProject(this.projectId!).subscribe(tasks => {
        console.log('taches reçues:', tasks); // vérifie les tâches reçues
        this.groupedTasks[0].tasks = tasks;
        this.groupedTasks[0].filteredTasks = tasks;
    });
    
      });
    
  }
  

  loadMembersByProject(projectId: number | null): void {
    if (!projectId) {
      this.filteredMembers = [];
      return;
    }
    
    this.teamMemberService.getMembersByProject(projectId).subscribe(
      (data) => {
        console.log('🚀 Membres reçus:', data);
        this.filteredMembers = data;
      },
      (error) => {
        console.error('Erreur chargement membres:', error);
        alert("Erreur lors du chargement des membres.");
      }
    );
  }
  getMemberName(memberId: number | null): string {
    const member = this.filteredMembers.find(m => m.id === memberId);
    return member ? member.name : 'Inconnu';
  }
  
  recalculateRemainingMD(assignment: any): void {
    if (assignment.estimatedMD != null && assignment.workedMD != null) {
      assignment.remainingMD = assignment.estimatedMD - assignment.workedMD;
    } else {
      assignment.remainingMD = 0;
    }
  }
  
  

  
  openModal(task?: ProjectTask, projectId?: number): void {
    this.isEditMode = !!task;
    this.selectedTask = task ? { ...task } : this.createEmptyTask();
    this.selectedTask.projectId = projectId ?? this.projectId;
    this.selectedTask.assignments.forEach(a => this.recalculateRemainingMD(a));

  
    this.loadMembersByProject(this.selectedTask.projectId);
  
    const modal = document.getElementById('taskModal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }
  

  closeModal(): void {
    const modal = document.getElementById('taskModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.selectedTask = this.createEmptyTask();
  }

  saveTask(): void {
    if (!this.selectedTask) return;

    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(this.selectedTask.status)) {
      alert('Le statut est invalide !');
      return;
    }

    if (!this.selectedTask.projectId) {
      alert("Erreur : Aucun projet sélectionné pour la tâche !");
      return;
    }

    const request = this.isEditMode
      ? this.taskService.updateTask(this.selectedTask.id!, this.selectedTask)
      : this.taskService.createTaskForProject(this.projectId!, this.selectedTask);

    request.subscribe(() => {
      this.loadCurrentProjectTasks();
      this.closeModal();
    }, error => {
      alert('Erreur lors de l\'enregistrement.');
      console.error(error);
    });
  }

  deleteTask(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.loadCurrentProjectTasks(),
        error: (error) => {
          console.error('Erreur suppression', error);
          alert("Erreur lors de la suppression !");
        }
      });
    }
  }
  

  downloadExcel(): void {
    this.taskService.downloadExcel(this.projects).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error => console.error('Erreur lors du téléchargement Excel :', error)
    );
  }

  createEmptyTask(): ProjectTask {
    return {
      id: undefined,
      name: '',
      description: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0],
      status: TaskStatus.TODO,
      progress: 0,
      projectId: this.projectId,
      assignments: []
    };
  }

  getStatusLabel(status: TaskStatus | string): string {
    switch (status) {
      case TaskStatus.TODO: return 'À faire';
      case TaskStatus.IN_PROGRESS: return 'En cours';
      case TaskStatus.DONE: return 'Terminé';
      case TaskStatus.BLOCKED: return 'Bloqué';
      default: return 'Inconnu';
    }
  }

  onSearchChange(groupIndex: number, event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    const group = this.groupedTasks[groupIndex];
    group.filteredTasks = group.tasks.filter(task =>
      task.name.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );
    group.currentPage = 1;
  }

  onPageChange(groupIndex: number, page: number): void {
    this.groupedTasks[groupIndex].currentPage = page;
  }
}
