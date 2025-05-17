import { Component, OnInit } from '@angular/core';
import { Project, ProjectDTO, Status } from 'src/app/model/project.model';
import { ProjectService } from 'src/app/services/project.service';
import { ClientService } from 'src/app/services/client.service';
import { UserService } from 'src/app/services/user.service';
import { Client } from 'src/app/model/client.model';
import { User } from 'src/app/model/user.model';
import { Team } from 'src/app/model/Team.model';
import { TeamMemberAllocation } from 'src/app/model/MemberAllocation.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {


  projects: Project[] = [];
  filteredProjects: Project[] = [];
  allTeams: Team[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  clients: Client[] = [];
  users: User[] = [];
  isEditMode: boolean = false;
  statusList = Object.values(Status);
  status = Status;
  teamMembersByTeam: { [teamId: number]: any[] } = {};
  allocations: { [key: string]: number } = {}; // key = memberId-projectId
  allocationsByProject: TeamMemberAllocation[] = [];
  selectedProject: Project = {
    id: 0,
    name: '',
    description: '',
    projectType: '',
    startDate: '',
    endDate: '',
    activity: '',
    technologie: '',
    clientId: null,
    userId: null,
    status: Status.EN_COURS,
    userName: '',
    teams: [],
    devisList: [],
    demandes: []
  };

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadClients();
    this.loadUsers();
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(
      data => {
        this.projects = data;
        console.log("📦 Projets chargés :", this.projects);
        this.filteredProjects = [...this.projects];

        // Charger toutes les équipes pour le select multiple du modal
        this.projectService.getAllTeams().subscribe(teamData => {
          this.allTeams = teamData;
        });
      },
      error => console.error('❌ Erreur chargement projets', error)
    );
  }


  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error("Erreur chargement clients", err)
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error("Erreur chargement utilisateurs", err)
    });
  }
  private modalInstance!: bootstrap.Modal;

  openModal(project?: Project): void {
    this.selectedProject = project ? { ...project } : {
      id: 0, name: '', description: '', projectType: '',
      startDate: '', endDate: '', activity: '', technologie: '', clientId: null, userId: null,
      status: Status.EN_COURS, userName: '', teams: [], devisList: [], demandes: []
    };

    this.isEditMode = !!project;

    const modalElement = document.getElementById('projectModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }




  // Remplace cette méthode :
  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }


  saveProject(): void {
    // ✅ On extrait uniquement les IDs des équipes
    const teamIds = (this.selectedProject.teams || [])
      .map(team => team.id)
      .filter((id): id is number => id !== undefined);

    const projectToSend: ProjectDTO = {
      id: this.selectedProject.id,
      name: this.selectedProject.name,
      description: this.selectedProject.description,
      projectType: this.selectedProject.projectType,
      startDate: this.selectedProject.startDate,
      endDate: this.selectedProject.endDate,
      activity: this.selectedProject.activity,
      technologie: this.selectedProject.technologie,
      status: this.selectedProject.status,
      clientId: this.selectedProject.clientId!, // 👈 vérifie bien qu’il n’est pas null
      userId: this.selectedProject.userId!,
      teamIds: teamIds
    };

    if (this.selectedProject.id && this.isEditMode) {
      this.projectService.updateProject(this.selectedProject.id, projectToSend).subscribe(() => {
        this.loadProjects();
        this.closeModal();
      });
    } else {
      this.projectService.createProject(projectToSend).subscribe(() => {
        this.loadProjects();
        this.closeModal();
      });
    }
  }

  // isTeamSelected(team: Team): boolean {
  // return this.selectedProject.teams.some(t => t.id === team.id);
  // }

  // toggleTeamSelection(team: Team, event: Event): void {
  // const checkbox = event.target as HTMLInputElement;
  // if (checkbox.checked) {
  // Ajoute si coché
  //   this.selectedProject.teams.push(team);
  //  } else {
  //    // Retire si décoché
  //     this.selectedProject.teams = this.selectedProject.teams.filter(t => t.id !== team.id);
  //  }
  // }


  deleteProject(id: number): void {
    if (confirm("Voulez-vous supprimer ce projet ?")) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.projects = this.projects.filter(p => p.id !== id);
        this.filteredProjects = [...this.projects];
      });
    }
  }

  searchProject(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.projectType.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
  }

  getStatusLabel(status: Status): string {
    const labels: { [key in Status]: string } = {
      [Status.EN_COURS]: "En cours",
      [Status.TERMINE]: "Terminé",
      [Status.EN_ATTENTE]: "En attente",
      [Status.ANNULE]: "Annulé",

    };
    return labels[status] || "INCONNU";
  }


  loadAllocations(projectId: number) {
    this.projectService.getAllocations(projectId).subscribe(data => {
      this.allocationsByProject = data;
    });
  }

  downloadExcel(): void {
    this.projectService.downloadExcel(this.projects).subscribe(
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

}
