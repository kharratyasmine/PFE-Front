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
      this.teams = project.teams || [];
    });
  }

  openAllocationModal(member: TeamMember): void {
    this.selectedMember = member;
    this.selectedAllocation = (member.allocation ?? 0) * 100;
    const modalEl = document.getElementById('allocationModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  saveAllocation(): void {
    const payload = {
      memberId: this.selectedMember.id,
      projectId: this.projectId,
      allocation: this.selectedAllocation / 100
    };

    const handleSuccess = (allocationId?: number) => {
      this.allocations[this.selectedMember.id!] = this.selectedAllocation;
      for (let team of this.teams) {
        const member = team.members.find(m => m.id === this.selectedMember.id);
        if (member) {
          member.allocation = payload.allocation;
          if (allocationId) member.allocationId = allocationId;
        }
      }
      this.hideModal('allocationModal');
    };

    if (this.selectedMember.allocationId) {
      this.projectService.updateAllocation(this.selectedMember.allocationId, payload)
        .subscribe(() => handleSuccess());
    } else {
      this.projectService.createAllocation(payload)
        .subscribe((response: { id: number }) => handleSuccess(response.id));
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
    if (this.selectedMemberIdToAdd && this.teamToAddMemberTo) {
      this.projectService.addMemberToTeam(this.teamToAddMemberTo.id, this.selectedMemberIdToAdd).subscribe(() => {
        alert("✅ Membre ajouté !");
        this.loadTeams();
        this.closeModal('addMemberModal');
      });
    }
  }
}
