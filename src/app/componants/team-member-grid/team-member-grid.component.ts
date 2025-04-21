import { Component } from '@angular/core';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-team-member-grid',
  templateUrl: './team-member-grid.component.html',
  styleUrls: ['./team-member-grid.component.css']
})
export class TeamMemberGridComponent {

  teamMembers: TeamMember[] = [];
    filteredMembers: TeamMember[] = [];
 constructor(
    private teamMemberService: TeamMemberService,
   
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }
  loadTeamMembers(): void {
    this.teamMemberService.getAllTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
        // On duplique dans filteredMembers pour la recherche / pagination
        this.filteredMembers = [...members];
        console.log("Liste des membres récupérée :", members);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des membres :", err);
      }
    });
  }

  searchMemberByName(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('🔍 Recherche de membre :', searchTerm);
    this.filteredMembers = this.teamMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm)
    );
    console.log('✅ Membres filtrés :', this.filteredMembers);
  }

    downloadExcel(): void {
      this.teamMemberService.downloadExcel(this.teamMembers).subscribe(
        data => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'teamsMembers.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error => console.error('Erreur lors du téléchargement Excel :', error)
      );
    }
}
