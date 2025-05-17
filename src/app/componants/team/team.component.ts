import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/model/project.model';
import { Team } from 'src/app/model/Team.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  projectId!: number;
  project!: Project;
  teams: Team[] = [];
  availableTeams: Team[] = [];
  selectedTeamId: number | null = null;
  allocations: { [memberId: number]: number } = {};
  availableMembers: TeamMember[] = [];
  selectedMemberIdToAdd: number | null = null;
  teamToAddMemberTo!: Team;
  selectedMember!: TeamMember;
  selectedAllocation: number = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadTeams();
    });
  }
  loadTeams(): void {
  this.projectService.getProjectById(this.projectId).subscribe(project => {
    this.project = project;

    this.teams = (project.teams || []).map(team => {
      const realMembers = team.members.map(member => {
        const allocation = member.allocation ?? 0;
        const allocationId = member.allocationId ?? null;

        return {
          ...structuredClone(member),
          allocationByTeamId: {
            [team.id]: {
              value: allocation,
              id: allocationId
            }
          }
        };
      });

      // 🔄 Ajouter les FakeMembers associés à une demande si cette team est générée automatiquement
      const fakeMembers: TeamMember[] = [];

      (project.demandes || []).forEach(demande => {
        if (demande.generatedTeamId === team.id && demande.fakeMembers) {
          demande.fakeMembers.forEach(fake => {
            fakeMembers.push({
              id: -Math.floor(Math.random() * 1000000), 
              name: fake.name,
              initial: fake.initial,
              jobTitle: "Temporaire",
              holiday: [],
              role: fake.role,
              cost: this.estimateCostByRole(fake.role),
              note: fake.note ?? "",
              image: "assets/img/profiles/default-avatar.jpg",
              experienceRange: "-",
              teams: [team.id],
              allocationByTeamId: {
                [team.id]: {
                  value: 0,
                  id: null
                }
              }
            });
          });
        }
      });

      return {
        ...team,
        members: [...realMembers, ...fakeMembers]
      };
    });
  });
}


  
  

  openAllocationModal(member: TeamMember, teamId: number): void {
    this.selectedTeamId = teamId;
    this.selectedMember = structuredClone(member); // 🛠️ Cloner pour éviter effet de bord
    const allocationInfo = this.selectedMember.allocationByTeamId?.[teamId];
    this.selectedAllocation = (allocationInfo?.value ?? 0) * 100;
  
    const modalEl = document.getElementById('allocationModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
  
  

  saveAllocation(): void {
    if (this.selectedTeamId === null) {
      alert("❌ Aucune équipe sélectionnée.");
      return;
    }
  
    const teamIdStr = String(this.selectedTeamId);
    const payload = {
      memberId: this.selectedMember.id,
      projectId: this.projectId,
      teamId: this.selectedTeamId,
      allocation: this.selectedAllocation / 100
    };
  
    const teamIndex = this.teams.findIndex(t => t.id === this.selectedTeamId);
    if (teamIndex !== -1) {
      const team = this.teams[teamIndex];
      const memberIndex = team.members.findIndex(m => m.id === this.selectedMember.id);
  
      if (memberIndex !== -1) {
        const member = team.members[memberIndex];
        const allocationInfo = member.allocationByTeamId?.[teamIdStr];
  
        const updateLocalMember = (allocationId?: number) => {
          team.members[memberIndex] = {
            ...member,
            allocationByTeamId: {
              ...member.allocationByTeamId,
              [teamIdStr]: {
                value: payload.allocation,
                id: allocationId ?? allocationInfo?.id ?? null
              }
            }
          };
  
          this.teams[teamIndex] = { ...team };
          this.hideModal('allocationModal');
        };
  
        if (allocationInfo?.id) {
          this.projectService.updateAllocation(allocationInfo.id, payload)
            .subscribe(() => updateLocalMember(allocationInfo.id!));
        } else {
          this.projectService.createAllocation(payload)
            .subscribe((response: { id: number }) => updateLocalMember(response.id));
        }
      }
    }
  }
  
  estimateCostByRole(role: string): number {
  switch (role.toUpperCase()) {
    case 'JUNIOR':
      return 200;
    case 'INTERMEDIAIRE':
      return 350;
    case 'SENIOR':
      return 500;
    case 'SENIOR_MANAGER':
      return 800;
    default:
      return 100;
  }
}

  

  hideModal(modalId: string): void {
    const modalEl = document.getElementById(modalId);
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  }

  closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  }

  removeTeam(teamId: number): void {
    if (confirm("Voulez-vous vraiment supprimer cette équipe ?")) {
      this.projectService.removeTeamFromProject(this.projectId, teamId).subscribe(() => {
        alert("✅ Équipe supprimée !");
        this.loadTeams();
      });
    }
  }

  removeMemberFromTeam(teamId: number, memberId: number): void {
    this.projectService.removeMemberFromTeam(teamId, memberId).subscribe({
      next: () => {
        alert("✅ Membre retiré !");
        this.loadTeams();
      },
      error: (err) => {
        console.error("❌ Erreur suppression membre", err);
      }
    });
  }

  openAddMemberModal(team: Team): void {
    this.teamToAddMemberTo = team;
    this.selectedMemberIdToAdd = null;

    this.projectService.getAvailableTeamMembers(team.id).subscribe(data => {
      this.availableMembers = data;
      const modalEl = document.getElementById('addMemberModal');
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
  }

 addMemberToTeam(): void {
  if (this.selectedMemberIdToAdd && this.selectedMemberIdToAdd > 0 && this.teamToAddMemberTo) {
    this.projectService.addMemberToTeam(this.teamToAddMemberTo.id, this.selectedMemberIdToAdd).subscribe(() => {
      alert("✅ Membre ajouté !");
      this.loadTeams();
      this.closeModal('addMemberModal');
    });
  } else {
    alert("❌ Vous ne pouvez pas ajouter un membre fictif manuellement !");
  }
}

}
