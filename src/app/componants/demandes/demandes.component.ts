import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Demande } from 'src/app/model/demande.model';         // Interface pour Demande
import { Project } from 'src/app/model/project.model';         // Interface pour Project
import { TeamMember } from 'src/app/model/TeamMember.model'; // Interface pour TeamMember
import { DemandeService } from 'src/app/services/demande.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { dateDemandeValidator } from '../validator/dateDemandeValidator';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.css']
})
export class DemandesComponent implements OnInit {

  project!: Project;
  demandes: Demande[] = [];
  allTeamMembers: TeamMember[] = [];
  demandeForm!: FormGroup;
  editMode: boolean = false;
  selectedDemande: Demande | null = null;
  projectId: number | null = null;

  constructor(
    private demandeService: DemandeService,
    private projectService: ProjectService,
    private teamMemberService: TeamMemberService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer l'id du projet depuis l'URL
    this.route.parent?.params.subscribe(params => {
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;
      if (this.projectId) {
        this.loadProject(this.projectId);
        this.loadTeamMembers();
        this.loadDemandes(this.projectId);
       
      }
    });

    // Initialisation du formulaire
    this.demandeForm = this.fb.group({
      name: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      scope: [''],           // ✅ Ajout obligatoire
      requirements: [''], 
      teamMemberIds: [[], Validators.required] ,


      },
    {
      validators:dateDemandeValidator(this.project?.startDate, this.project?.endDate)
    });    
  };
  

  // Charge le projet courant
  loadProject(projectId: number): void {
    this.projectService.getProjectById(projectId).subscribe(proj => {
      this.project = proj;
    });
  }

  // Charge les demandes associées au projet
  loadDemandes(projectId: number): void {
    this.demandeService.getDemandesByProject(projectId).subscribe(data => {
      this.demandes = data;
      console.log("✅ Tous les demandes récupérés :", data);
      // Optionnel : si ton projet contient aussi les demandes
      if (this.project) {
        this.project.demandes = data;
      }
    });
  }

  // Charge la liste des membres affectés à ce projet
  loadTeamMembers(): void {
    this.teamMemberService.getAllTeamMembers().subscribe(data => {
      console.log("✅ Tous les membres récupérés :", data);
      this.allTeamMembers = data;
    });
  }
  
  
  

  getMemberName(id: number): string {
    const member = this.allTeamMembers.find(m => m.id === id);
    return member ? member.name : 'Inconnu';
  }
  
  // Ouvre la modale pour ajouter ou modifier une demande
  openModal(demande?: Demande): void {
    this.editMode = !!demande;
  
    if (demande) {
      this.selectedDemande = { ...demande };
      this.demandeForm.patchValue({
        name: demande.name,
        dateDebut: demande.dateDebut,
        dateFin: demande.dateFin,
        teamMemberIds: demande.teamMemberIds,
        scope: demande.scope,
        requirements: demande.requirements
      });
    } else {
      this.selectedDemande = null;
      this.demandeForm.reset();
    }
  
    const modalElement = document.getElementById('demandeModal');
    if (modalElement) {
      // Utilisation correcte de Bootstrap
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  

  saveDemande(): void {
    if (this.demandeForm.invalid || !this.projectId) {
      return;
    }
  
    const demandeData: Demande = {
      id: this.editMode ? this.selectedDemande?.id : undefined,
      name: this.demandeForm.value.name,
      dateDebut: this.demandeForm.value.dateDebut,
      dateFin: this.demandeForm.value.dateFin,
      projectId: this.projectId,
      clientId: this.project.clientId ?? this.project.client?.id ?? 0,
      teamMemberIds: this.demandeForm.value.teamMemberIds,
      scope: this.demandeForm.value.scope,
      requirements: this.demandeForm.value.requirements
    };
  
    console.log("📦 Données envoyées :", demandeData);
  
    const action = this.editMode
      ? this.demandeService.updateDemande(demandeData.id!, demandeData)
      : this.demandeService.createDemande(demandeData);
  
    action.subscribe({
      next: () => {
        this.loadDemandes(this.projectId!);
        this.loadProject(this.projectId!);
        this.closeModal();
      },
      error: (err) => {
        console.error("❌ Erreur lors de la création de la demande :", err);
        alert("Erreur serveur : impossible de créer la demande !");
      }
    });
  }
  

deleteDemande(id: number): void {
    this.demandeService.deleteDemande(id).subscribe(() => {
      this.loadDemandes(this.projectId!);
      this.loadProject(this.projectId!); // ✅ pour rafraîchir les dates après suppression
    });
}



  // Ferme la modale
  closeModal(): void {
    const modalElement = document.getElementById('demandeModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide(); // ✅ ferme proprement
      }
    }
  }
  
}
