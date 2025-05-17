import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from 'src/app/model/client.model';
import { Demande } from 'src/app/model/demande.model';
import { Project, Status } from 'src/app/model/project.model';
import { User } from 'src/app/model/user.model';
import { ClientService } from 'src/app/services/client.service';
import { DemandeService } from 'src/app/services/demande.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  
  clients: Client[] = [];
  users: User[] = [];
  project: Project | null = {
    id: 0,
    name: '',
    projectType: '',
    description: '',
    startDate: '',
    endDate: '',
    userName: '',
    demandes: [],
    devisList: [],
    teams: [],
    activity: '',
    technologie: '',
    clientId: null,
    userId: null,
    status: Status.EN_COURS,
  };
  


  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private clientService: ClientService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProjectDetails(+id);
        this.loadClients();
        this.loadUsers();
      }
    });
  }

  loadProjectDetails(id: number): void {
    this.projectService.getProjectById(id).subscribe(
      (data) =>{ 
        this.project = data
        console.log("🔁 Détails du projet récupérés : ", data);
     },
      (error) => console.error('❌ Erreur chargement projet', error)
    );
  }


  loadClients(): void {
    this.clientService.getAllClients().subscribe(
      (data) => {
        console.log("✅ Clients récupérés :", data);
        this.clients = data;
      },
      (error) => {
        console.error("❌ Erreur chargement clients", error);
      }
    );
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        console.log("✅ Utilisateurs récupérés :", data);
        this.users = data;
      },
      (error) => {
        console.error("❌ Erreur chargement utilisateurs", error);
      }
    );
  }



}
