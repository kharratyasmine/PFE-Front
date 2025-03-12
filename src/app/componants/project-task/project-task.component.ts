import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { Project } from 'src/app/model/project.model';
import { ProjectTask, TaskStatus } from 'src/app/model/ProjectTask.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { ProjectTaskService } from 'src/app/services/project-task.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-project-task',
  templateUrl: './project-task.component.html',
  styleUrls: ['./project-task.component.css']
})
export class ProjectTaskComponent  implements OnInit {

  tasks: ProjectTask[] = [];
  filteredTasks: ProjectTask[] = [];
  availableMembers: TeamMember[] = [];
  availableProjects: Project[] = [];
  selectedTaskId: number | null = null;
  modalInstance: any;

  status = status; // Référence à l'énumération pour le template
  statusKeys = Object.keys(status).filter(key => isNaN(Number(key))) as (keyof typeof status)[];

  // ✅ Initialisation d'une tâche vide
  selectedTask: ProjectTask = {
    id: 0,
      name: '',
      description: '',
      status: TaskStatus.EN_COURS ,
      startDate: new Date(),
      endDate: new Date(),
      progress: 0,
      teamMember: null,
      project: null
  };

  constructor(
    private projectTaskService: ProjectTaskService,
    private teamMemberService: TeamMemberService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadMembers();
    this.loadProjects();
  }

  loadTasks(): void {
    this.projectTaskService.getAllTasks().subscribe(
      (data) => {
        this.tasks = data;
        this.filteredTasks = [...this.tasks];
      },
      (error) => {
        console.error('❌ Erreur lors du chargement des tâches', error);
      }
    );
  }

    getStatusList(): string[] {
      return Object.values(status);  // ✅ Retourne la liste des statuts sous forme de string
    }
    
    statusList = Object.values(status);
  
    getStatusLabel(status: TaskStatus): string {
      const labels: { [key in TaskStatus]: string } = {
        [status.EN_COURS]: "En cours",
        [status.TERMINE]: "Terminé",
        [status.EN_ATTENTE]: "En attente",
        [status.ANNULE]: "Annulé",
      };
      return labels[status] || "INCONNU";
    }

  loadMembers(): void {
    this.teamMemberService.getTeamMembers().subscribe(
      (data) => {
        this.availableMembers = data;
      },
      (error) => {
        console.error('❌ Erreur lors du chargement des membres', error);
      }
    );
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        this.availableProjects = data;
      },
      (error) => {
        console.error('❌ Erreur lors du chargement des projets', error);
      }
    );
  }

  openModal(): void {
    this.tasks = { 
      id: 0,
      name: '',
      description: '',
      statut: '',
      startDate: new Date(),
      endDate: new Date(),
      progress: 0,
      teamMember: null,
      project: null
    };
    this.selectedTaskId = null;
    this.showModal('taskModal');
  }

  openEditModal(projectTask: ProjectTask): void {
    this.selectedTaskId = projectTask.id;
    this.task = { ...projectTask };
    this.showModal('taskModal');
  }

  closeModal(): void {
    this.hideModal('taskModal');
    this.selectedTaskId = null;
  }
  convertToDate(field: 'startDate' | 'endDate', event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.task[field] = new Date(input.value);
    }
  }
  
  saveTask(): void {
    if (!this.task.project || !this.task.project.id) {
      alert('❌ Sélectionnez un projet avant d\'ajouter une tâche.');
      return;
    }
    if (!this.task.teamMember || !this.task.teamMember.id) {
      alert('❌ Sélectionnez un membre de l\'équipe avant d\'ajouter une tâche.');
      return;
    }
  
    // ✅ Vérifie que les valeurs saisies sont bien des dates
    if (!(this.task.startDate instanceof Date) || isNaN(this.task.startDate.getTime())) {
      alert("❌ La date de début est invalide !");
      return;
    }
    if (!(this.task.endDate instanceof Date) || isNaN(this.task.endDate.getTime())) {
      alert("❌ La date de fin est invalide !");
      return;
    }
  
    // ✅ Envoi au backend avec des dates sous format ISO
    const taskToSend: ProjectTask = {
      ...this.task,
      startDate: new Date(this.task.startDate),  // ✅ Reste un objet `Date`
      endDate: new Date(this.task.endDate)       // ✅ Reste un objet `Date`
    };
  
    console.log("📤 Envoi de la tâche :", taskToSend);
  
    this.projectTaskService.createTask(taskToSend).subscribe(
      (newTask) => {
        console.log("✅ Tâche ajoutée avec succès :", newTask);
        this.tasks.push(newTask);
        this.filteredTasks = [...this.tasks];
        this.closeModal();
      },
      (error) => {
        console.error('❌ Erreur lors de l\'ajout de la tâche', error);
      }
    );
  }
  
  

  deleteTask(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      this.projectTaskService.deleteTask(id).subscribe(
        () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
          this.filteredTasks = [...this.tasks];
        },
        (error) => {
          console.error('❌ Erreur lors de la suppression de la tâche', error);
        }
      );
    }
  }


    private showModal(id: string): void {
      const modalElement = document.getElementById(id);
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement);
        this.modalInstance.show();
      }
    }
  
    hideModal(id: string): void {
      if (this.modalInstance) {
        this.modalInstance.hide();
        this.modalInstance = null;
      }
    }
    /**
   * ✅ Filtrer les tâches en fonction du texte entré
   */
    searchTaskByName(event: Event): void {
      const target = event.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      console.log('🔍 Recherche de tâche :', searchTerm);
  
      this.filteredTasks = this.tasks.filter(task => 
        task.name.toLowerCase().includes(searchTerm)
      );
  
      console.log('✅ Tâches filtrées :', this.filteredTasks);
    }
  
    /**
     * ✅ Télécharger la liste des tâches en Excel
     */
    downloadExcel(): void {
      this.projectTaskService.downloadExcel(this.tasks).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'tasks.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('❌ Erreur lors du téléchargement du fichier Excel', error);
        }
      );
    }
  
  
}
