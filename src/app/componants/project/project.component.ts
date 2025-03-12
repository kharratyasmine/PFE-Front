import { Component, OnInit } from '@angular/core';
import { Client } from 'src/app/model/client.model';
import { Project, Status } from 'src/app/model/project.model';
import { Role } from 'src/app/model/role.enum';
import { User } from 'src/app/model/user.model';
import { ClientService } from 'src/app/services/client.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
 
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  clients: Client[] = []; 
  user:User[]=[];
  
 
  status = status; // Référence à l'énumération pour le template
  statusKeys = Object.keys(status).filter(key => isNaN(Number(key))) as (keyof typeof status)[];
   
  selectedProject: Project = {
    id: 0,
    name: '',
    projectType: '',
    description: '',
    startDate: '',
    endDate: '',
    status: Status.EN_COURS,
    scope: '',
    client: { id: 0, name: '', contact: '', address: '', email: '' },
    user: {
      id: 0, firstname: '', lastname: '', email: '', role: Role.CHEF_EQUIPE,
      motDePasse: ''
    },
    requirements: '',
    devisList: [],
    affectations: [],
    team: [],
    tasks: []
  };
  modalInstance: any;
  

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
    private userService:UserService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    this.loadUsers();
  }

  /**
   * Charger la liste des clients depuis le backend.
   */
  loadClients(): void {this.clientService.getAllClients().subscribe(
    (data) => {
      console.log("✅ Clients récupérés :", data);
      this.clients = data;
    },
    (error) => {
      console.error("❌ Erreur chargement clients", error);
      console.log("📌 Détails de l'erreur :", error.message);
      console.log("📌 Réponse complète :", error);
    }
  );
}
  /**
   * Charger la liste des projets depuis le backend.
   */
  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        console.log("✅ Projets récupérés :", data);
        this.projects = data;
        this.filteredProjects = [...this.projects];
      },
      (error) => {
        console.error('❌ Erreur chargement projets', error);
      }
    );
  }
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        console.log("✅ Utilisateurs récupérés :", data);
        this.user = data; // Stocke les utilisateurs disponibles
      },
      (error) => {
        console.error("❌ Erreur chargement utilisateurs", error);
      }
    );
  }
  
  getStatusList(): string[] {
    return Object.values(status);  // ✅ Retourne la liste des statuts sous forme de string
  }
  
  statusList = Object.values(Status);

  getStatusLabel(status: Status): string {
    const labels: { [key in Status]: string } = {
      [Status.EN_COURS]: "En cours",
      [Status.TERMINE]: "Terminé",
      [Status.EN_ATTENTE]: "En attente",
      [Status.ANNULE]: "Annulé",
      [Status.EN_ATTENTE_DEVIS]: "En attente devis",
      [Status.EN_ATTENTE_VALIDATION]: "En attente validation",
      [Status.EN_ATTENTE_VALIDATION_DEVIS]: "En attente validation devis",
      [Status.EN_ATTENTE_VALIDATION_AFFECTATION]: "En attente validation affectation"
    };
    return labels[status] || "INCONNU";
  }
  

  /**
   * Ouvrir la modale pour ajouter/modifier un projet.
   */
  openModal(project?: Project): void {
    this.selectedProject = project ? { ...project } : {
      id: 0,
      name: '',
      projectType: '',
      description: '',
      startDate: '',
      endDate: '',
      status: Status.EN_COURS,
      scope: '',
      requirements: '',
      client: null, 
      user: null,
      devisList: [],
      affectations: [],
      team: [],
      tasks: []
    };

    const modal = document.getElementById('projectModal');
    if (modal) {
      (modal as any).showModal();
    }
  }

  /**
   * Fermer la modale d'ajout/modification.
   */
  closeModal(): void {
    const modal = document.getElementById('projectModal');
    if (modal) {
      (modal as any).close();
    }
  }

  /**
   * Télécharger les projets au format Excel.
   */
  downloadExcel(): void {
    this.projectService.downloadExcel(this.projects).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('❌ Erreur lors du téléchargement du fichier Excel :', error);
      }
    );
  }

  /**
   * Ajouter ou mettre à jour un projet.
   */
  saveProject(): void {
    console.log("📤 Projet à envoyer :", this.selectedProject);
  
    // ✅ Vérifier et simplifier `client`
    if (this.selectedProject.client) {
      this.selectedProject.client = {
        id: this.selectedProject.client.id,
        name: this.selectedProject.client.name || '',
        contact: this.selectedProject.client.contact || '',
        address: this.selectedProject.client.address || '',
        email: this.selectedProject.client.email || ''
      };
    }
  
    // ✅ Vérifier et simplifier `user`
    if (this.selectedProject.user) {
      this.selectedProject.user = {
        id: this.selectedProject.user.id,
        firstname: this.selectedProject.user.firstname || '',
        lastname: this.selectedProject.user.lastname || '',
        email: this.selectedProject.user.email || '',
        motDePasse: this.selectedProject.user.motDePasse || '',
        role: this.selectedProject.user.role || Role.CHEF_EQUIPE 

      };
    }
  
    if (this.selectedProject.id) {
      console.log("🚀 Données finales envoyées pour update :", this.selectedProject);
      
      this.projectService.updateProject(this.selectedProject.id, this.selectedProject).subscribe(
        (updatedProject) => {
          console.log("📥 Réponse backend après update :", updatedProject);
          this.loadProjects();  
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur mise à jour projet", error);
        }
      );
    } else {
      this.projectService.createProject(this.selectedProject).subscribe(
        (newProject) => {
          console.log("✅ Projet ajouté :", newProject);
  
          // 🔥 Mettre à jour `selectedProject` avec l'ID généré
          this.selectedProject = { ...newProject };
  
          // 🔥 Met à jour directement `this.projects`
          this.projects.push(newProject);
  
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur ajout projet", error);
        }
      );
    }
  }
  
  /**
   * Supprimer un projet après confirmation.
   */
  
  deleteProject(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
      this.projectService.deleteProject(id).subscribe(
        () => {
          console.log(`✅ Projet supprimé.`);
          
          // 🔥 Met à jour la liste sans recharger la page
          this.projects = this.projects.filter(project => project.id !== id);
          this.filteredProjects = [...this.projects]; // Met aussi à jour la liste filtrée
        },
        (error) => {
          console.error("❌ Erreur suppression projet", error);
          alert("Erreur lors de la suppression du projet : " + error.message);
        }
      );
    }
  }
  
  


  /**
   * Filtrer les projets par nom.
   */
  searchProject(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProjects = this.projects.filter(project => project.name.toLowerCase().includes(searchTerm));
  }

  /**
   * Ouvrir une modale Bootstrap.
   */
  private showModal(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  /**
   * Fermer la modale Bootstrap.
   */
  closeViewModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }
}
