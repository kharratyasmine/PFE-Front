import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Demande, FakeMember } from 'src/app/model/demande.model';
import { Project } from 'src/app/model/project.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
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
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math = Math; // Pour utiliser Math dans le template

  temporaryMembers: TeamMember[] = [
    { id: -1, name: 'Inconnu (Junior)', role: 'JUNIOR', initial: 'IJ', jobTitle: 'Temporaire', holiday: [], image: 'assets/img/profiles/default-avatar.jpg', cost: 200, startDate: '', note: '', experienceRange: '', teams: [] },
    { id: -2, name: 'Inconnu (Senior)', role: 'SENIOR', initial: 'IS', jobTitle: 'Temporaire', holiday: [], image: 'assets/img/profiles/default-avatar.jpg', cost: 500, startDate: '', note: '', experienceRange: '', teams: [] },
    { id: -3, name: 'Inconnu (INTERMEDIAIRE)', role: 'INTERMEDIAIRE', initial: 'IE', jobTitle: 'Temporaire', holiday: [], image: 'assets/img/profiles/default-avatar.jpg', cost: 350, startDate: '', note: '', experienceRange: '', teams: [] },
    { id: -4, name: 'Inconnu (SENIOR_MANAGER)', role: 'SENIOR_MANAGER', initial: 'ISM', jobTitle: 'Temporaire', holiday: [], image: 'assets/img/profiles/default-avatar.jpg', cost: 800, startDate: '', note: '', experienceRange: '', teams: [] }
  ];

  constructor(
    private demandeService: DemandeService,
    private projectService: ProjectService,
    private teamMemberService: TeamMemberService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;
      if (this.projectId) {
        this.loadProject(this.projectId);
        this.loadTeamMembers();
        this.loadDemandes(this.projectId);
      }
    });

    this.demandeForm = this.fb.group({
      name: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      scope: [''],
      requirements: [''],
      teamMemberIds: [[], Validators.required],
    }, {
      validators: dateDemandeValidator(this.project?.startDate, this.project?.endDate)
    });
  }

  loadProject(projectId: number): void {
    this.projectService.getProjectById(projectId).subscribe(proj => {
      this.project = proj;
    });
  }

  loadDemandes(projectId: number): void {
    this.demandeService.getDemandesByProject(projectId).subscribe(data => {
      this.demandes = data;
      if (this.project) {
        this.project.demandes = data;
      }
    });
  }

 loadTeamMembers(): void {
  this.teamMemberService.getAllTeamMembers().subscribe(data => {
    const merged = [...data, ...this.temporaryMembers];
    this.allTeamMembers = merged.filter((value, index, self) =>
      index === self.findIndex(m =>
        m.name.trim().toLowerCase() === value.name.trim().toLowerCase() &&
        m.role === value.role
      )
    );
  });
}

  getMemberName(id: number): string {
    const member = this.allTeamMembers.find(m => m.id === id);
    return member ? member.name : `Inconnu (id: ${id})`;
  }

  getFakeMemberById(id: number): TeamMember | undefined {
    return this.temporaryMembers.find(m => m.id === id);
  }

openModal(demande?: Demande): void {
  this.editMode = !!demande;

  if (demande) {
    this.selectedDemande = { ...demande };

    // Combine teamMemberIds (réels) + membres fictifs (négatifs)
    const fakeMemberIds = (demande.fakeMembers ?? []).map(f => {
      const found = this.temporaryMembers.find(m => m.name === f.name && m.role === f.role);
      return found ? found.id : null;
    }).filter((id): id is number => id !== null); // filtrer les null

    const combinedIds = [...Array.from(demande.teamMemberIds || []), ...fakeMemberIds];

    this.demandeForm.patchValue({
      name: demande.name,
      dateDebut: demande.dateDebut,
      dateFin: demande.dateFin,
      teamMemberIds: combinedIds,
      scope: demande.scope,
      requirements: demande.requirements
    });
  } else {
    this.selectedDemande = null;
    this.demandeForm.reset();
  }

  const modalElement = document.getElementById('demandeModal');
  if (modalElement) {
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }
}

  getDisplayedMembers(demande: Demande): string[] {
  const realNames = demande.teamMemberIds
    ? Array.from(demande.teamMemberIds)
        .map(id => this.getMemberName(id))
    : [];

  const fakeNames = demande.fakeMembers
    ? demande.fakeMembers.map(f => f.name)
    : [];

  return [...realNames, ...fakeNames];
}


saveDemande(): void {
  if (!this.projectId) return;

  if (this.demandeForm.invalid) {
    if (this.demandeForm.get('teamMemberIds')?.hasError('required')) {
      alert("Veuillez sélectionner au moins un membre !");
    }
    this.demandeForm.markAllAsTouched();
    return;
  }

  const allIds: number[] = this.demandeForm.value.teamMemberIds;
  const realMemberIds: number[] = allIds.filter((id) => id > 0);

  const fakeMembers: FakeMember[] = allIds
    .filter((id) => id < 0)
    .map((id): FakeMember | null => {
      const member = this.getFakeMemberById(id);
      return member
        ? {
            name: member.name,
            role: member.role,
            initial: member.initial,
            note: member.note ?? '',
          }
        : null;
    })
    .filter((f): f is FakeMember => f !== null); // ✅ typage précis

  const demandeData: Demande = {
    id: this.editMode ? this.selectedDemande?.id : undefined,
    name: this.demandeForm.value.name,
    dateDebut: this.demandeForm.value.dateDebut,
    dateFin: this.demandeForm.value.dateFin,
    projectId: this.projectId,
    clientId: this.project.clientId ?? this.project.client?.id ?? 0,
    teamMemberIds: realMemberIds,
    fakeMembers: fakeMembers,
    scope: this.demandeForm.value.scope,
    requirements: this.demandeForm.value.requirements, 
  };

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
      this.loadProject(this.projectId!);
    });
  }

  closeModal(): void {
    const modalElement = document.getElementById('demandeModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Réinitialiser à la première page
  }
}
