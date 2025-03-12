import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/model/project.model';
import { Team } from 'src/app/model/Team.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  allMembers: TeamMember[] = [];
  selectedMembers: TeamMember[] = [];
  selectedTeam: Team = { id: 0, name: '', project: undefined, members: [] };

  projects: Project[] = [];

  constructor(
    private teamService: TeamService,
    private teamMemberService: TeamMemberService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadMembers();
    this.loadProjects();

    console.log("📌 Initialisation des données...");
  }

  /**
   * Charger toutes les équipes depuis l'API
   */
  loadTeams(): void {
    this.teamService.getAllTeams().subscribe(
      (data) => {
        console.log('✅ Équipes récupérées :', data);
        this.teams = data;
        this.filteredTeams = [...this.teams];
      },
      (error) => console.error('❌ Erreur chargement équipes', error)
    );
  }

  /**
   * Charger tous les membres d'équipe disponibles
   */
  loadMembers(): void {
    this.teamMemberService.getTeamMembers().subscribe(
      (data) => {
        console.log('✅ Membres récupérés :', data);
        this.allMembers = data;
      },
      (error) => console.error('❌ Erreur chargement membres', error)
    );
  }

  /**
   * Charger tous les projets disponibles
   */
  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        console.log('✅ Projects récupérés :', data);
        this.projects = data;
      },
      (error) => console.error('❌ Erreur chargement projets', error)
    );
  }

  /**
   * Vérifie si un membre est déjà sélectionné dans l'équipe
   **/
  isMemberSelected(member: TeamMember): boolean {
    return this.selectedTeam.members?.some(m => m.id === member.id);
  }

  /**
   * Récupérer les noms des membres sous forme de chaîne
   */
  getMemberNames(members: TeamMember[], limit?: number): string {
    if (!members || members.length === 0) return "Aucun membre";

    const memberNames = members.map(m => m.name);
    return limit ? memberNames.slice(0, limit).join(', ') : memberNames.join(', ');
  }

  /**
   * Ouvrir la modale pour ajouter/modifier une équipe
   */
  openModal(team?: Team): void {
    this.selectedTeam = team ? { ...team, members: [...(team.members || [])] } : { id: 0, name: '', members: [] };
    this.selectedMembers = team?.members ? [...team.members] : [];

    const modal = document.getElementById('teamModal');
    if (modal) {
      (modal as any).showModal();
    }
  }

  /**
   * Fermer la modale
   */
  closeModal(): void {
    const modal = document.getElementById('teamModal');
    if (modal) {
      (modal as any).close();
    }
  }

  /**
   * Ajouter/Retirer un membre de l'équipe lorsqu'on coche/décoche
   */
  toggleMemberSelection(member: TeamMember): void {
    if (!this.selectedTeam.members) {
      this.selectedTeam.members = [];
    }

    const index = this.selectedTeam.members.findIndex(m => m.id === member.id);
    if (index > -1) {
      this.selectedTeam.members.splice(index, 1);
    } else {
      this.selectedTeam.members.push(member);
    }
  }

  /**
   * Enregistrer l'équipe (ajout ou mise à jour)
   */
  saveTeam(): void {
    console.log("📤 Données envoyées pour update:", this.selectedTeam);

    // ✅ Assurer que `selectedTeam.members` contient bien des objets `TeamMember`
    this.selectedTeam.members = this.selectedMembers.map(member => ({
      id: member.id,
      image: member.image,
      name: member.name,
      initial: member.initial,
      allocation: member.allocation,
      teamRole: member.teamRole,
      holiday: member.holiday,
      dateEmbauche: member.dateEmbauche,
      seniorite: member.seniorite,
      cout: member.cout,
      note: member.note,
      team: this.selectedTeam // ✅ Correction ici
    }));
    

    // ✅ Vérifier et formater `project` correctement
    if (this.selectedTeam.project) {
      this.selectedTeam.project = { ...this.selectedTeam.project }; // On garde l’objet complet
    }

    console.log("🚀 Données finales envoyées :", JSON.stringify(this.selectedTeam, null, 2));

    if (this.selectedTeam.id) {
      this.teamService.updateTeam(this.selectedTeam.id, this.selectedTeam).subscribe(
        () => {
          console.log("✅ Équipe mise à jour !");
          this.loadTeams();
          this.closeModal();
        },
        (error) => console.error("❌ Erreur mise à jour équipe", error)
      );
    } else {
      this.teamService.createTeam(this.selectedTeam).subscribe(
        () => {
          console.log("✅ Équipe ajoutée !");
          this.loadTeams();
          this.closeModal();
        },
        (error) => console.error("❌ Erreur ajout équipe", error)
      );
    }
  }

  /**
   * Supprimer une équipe après confirmation
   */
  deleteTeam(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer cette équipe ?")) {
      this.teamService.deleteTeam(id).subscribe(
        () => {
          console.log(`✅ Équipe supprimée.`);
          this.teams = this.teams.filter(team => team.id !== id);
          this.filteredTeams = [...this.teams];
        },
        (error) => {
          console.error('❌ Erreur suppression équipe', error);
          alert("Erreur lors de la suppression de l'équipe : " + error.message);
        }
      );
    }
  }

  /**
   * Rechercher une équipe par nom
   */
  searchTeamByName(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTeams = this.teams.filter(team => team.name.toLowerCase().includes(searchTerm));
  }

  /**
   * Télécharger la liste des équipes en Excel
   */
  downloadExcel(): void {
    this.teamService.downloadExcel(this.teams).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teams.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => console.error('❌ Erreur lors du téléchargement du fichier Excel :', error)
    );
  }
}
