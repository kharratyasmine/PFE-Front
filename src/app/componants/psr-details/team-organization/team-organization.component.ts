import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Psr } from 'src/app/model/psr.model';
import { TeamOrganization } from 'src/app/model/TeamOrganization.model';
import { PsrService } from 'src/app/services/psr.service';
import { TeamOrganizationService } from 'src/app/services/TeamOrganization.service';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/model/project.model';

@Component({
  selector: 'app-team-organization',
  templateUrl: './team-organization.component.html',
  styleUrls: ['./team-organization.component.css']
})
export class TeamOrganizationComponent implements OnInit {
  @Input() psrId!: number | undefined;
  @Input() psr!: Psr;
  teamMembers: TeamOrganization[] = [];
  loading = false;
  error = '';
  projectStartDate: string = '';
  projectEndDate: string = '';

  constructor(
    private psrService: PsrService,
    private teamOrganizationService: TeamOrganizationService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.psrId || +this.route.snapshot.paramMap.get('id')!;
    
    if (idParam && !isNaN(idParam)) {
      this.psrId = idParam;
      console.log('Chargement TeamOrganization pour PSR ID :', this.psrId);
      
      if (this.psr && this.psr.projectId) {
        this.getProjectDates(this.psr.projectId);
      } else {
        this.loading = true;
        this.psrService.getById(idParam).subscribe({
          next: (psr: Psr) => {
            this.psr = psr;
            if (psr.projectId) {
              this.getProjectDates(psr.projectId);
            } else {
              this.loadTeamMembersByWeek();
            }
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Erreur lors du chargement du PSR :', err);
            this.error = 'Impossible de charger les informations du PSR.';
            this.loading = false;
          }
        });
      }
    } else {
      this.error = "Aucun identifiant de PSR n'a été fourni.";
    }
  }

  getProjectDates(projectId: number): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project: Project) => {
        this.projectStartDate = project.startDate;
        this.projectEndDate = project.endDate;
        this.loadTeamMembersByWeek();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du projet :', err);
        this.loadTeamMembersByWeek();
      }
    });
  }

  loadTeamMembersByWeek(): void {
    if (!this.psrId || !this.psr?.week) {
      this.error = "Informations PSR incomplètes. Impossible de charger les données.";
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.teamOrganizationService.getTeamOrganizationByWeek(this.psrId, this.psr.week).subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.error = `Aucune donnée d'équipe disponible pour la semaine ${this.psr.week}`;
        } else {
          if (this.projectStartDate && this.projectEndDate) {
            data.forEach(member => {
              member.plannedStartDate = this.projectStartDate;
              member.plannedEndDate = this.projectEndDate;
            });
          }
          // Parse the holiday string into an array of holiday details and filter by week
          const weekNumber = Number(this.psr.week);
          data.forEach(member => {
            if (member.holiday) {
              member.holidayDetails = member.holiday.split(', ')
                .map(h => {
                  const parts = h.trim().split('|');
                  return { date: parts[0], type: parts.length > 1 ? parts[1] : '' };
                })
                .filter(holiday => this.isHolidayInWeek(holiday.date, weekNumber));
            } else {
              member.holidayDetails = [];
            }
          });
          this.teamMembers = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des membres de l\'équipe :', err);
        this.error = 'Impossible de charger les membres de l\'équipe. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  // Nouvelle méthode pour vérifier si un congé est dans la semaine spécifiée
  private isHolidayInWeek(holidayDate: string, week: number | undefined): boolean {
    if (!week) return false;
    const date = new Date(holidayDate);
    const weekNumber = this.getWeekNumber(date);
    return weekNumber === week;
  }

  // Méthode pour obtenir le numéro de semaine d'une date
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Vérifie si un membre est dans plusieurs équipes
  isMemberInMultipleTeams(member: TeamOrganization): boolean {
    return this.teamMembers.filter(m => m.initial === member.initial).length > 1;
  }

  // Method to expose team members data for export
  getTeamMembersData(): TeamOrganization[] {
    return this.teamMembers;
  }

  // Retourne la classe CSS pour le badge d'allocation
  getAllocationBadgeClass(allocation: string | number): string {
    const allocationNumber = typeof allocation === 'string' ? parseFloat(allocation) : allocation;
    
    if (isNaN(allocationNumber)) return 'bg-secondary';
    if (allocationNumber >= 100) return 'bg-success';
    if (allocationNumber >= 50) return 'bg-primary';
    if (allocationNumber > 0) return 'bg-warning';
    return 'bg-secondary';
  }

  formatHoliday(holiday: string): string {
    if (!holiday) return '';
    
    // Si le format est "date|type", on extrait juste la date
    const parts = holiday.split('|');
    if (parts.length > 0) {
      return parts[0];
    }
    return holiday;
  }

  // TODO: Si l'ajout d'un membre ou d'une équipe est géré dans ce composant,
  // la méthode d'ajout devrait appeler this.loadTeamMembersByWeek() après succès
  // Exemple (méthode hypothétique d'ajout de membre):
  /*
  addTeamMember(newMemberData: any): void {
    // Appel au service backend pour ajouter le membre
    this.teamOrganizationService.addTeamMember(this.psrId!, this.psr.week, newMemberData).subscribe({
      next: () => {
        console.log('Membre ajouté avec succès');
        // Recharger les données pour mettre à jour le tableau
        this.loadTeamMembersByWeek();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du membre :', err);
        // Gérer l'erreur
      }
    });
  }
  */
}
