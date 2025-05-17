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
      
      // Si nous avons déjà le PSR via l'Input
      if (this.psr && this.psr.projectId) {
        this.getProjectDates(this.psr.projectId);
      } else {
        // Sinon, on charge le PSR d'abord
        this.psrService.getById(idParam).subscribe({
          next: (psr: Psr) => {
            this.psr = psr;
            if (psr.projectId) {
              this.getProjectDates(psr.projectId);
            } else {
              this.loadAllProjectMembers();
            }
          },
          error: (err: any) => {
            console.error('Erreur lors du chargement du PSR :', err);
            this.error = 'Impossible de charger les informations du PSR.';
          }
        });
      }
    } else {
      this.error = "Aucun identifiant de PSR n'a été fourni.";
      console.warn("ID PSR manquant dans l'URL ou le composant parent.");
    }
  }

  getProjectDates(projectId: number): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project: Project) => {
        this.projectStartDate = project.startDate;
        this.projectEndDate = project.endDate;
        this.loadAllProjectMembers();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du projet :', err);
        // En cas d'erreur, on charge quand même les membres sans les dates du projet
        this.loadAllProjectMembers();
      }
    });
  }

  loadTeamOrganization(psrId: number): void {
    this.loading = true;
    this.error = '';
    
    this.teamOrganizationService.getTeamOrganization(psrId).subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement TeamOrganization:', err);
        this.error = 'Impossible de charger les membres de l\'équipe. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  loadAllProjectMembers(): void {
    if (!this.psrId) return;
    this.loading = true;
    this.teamOrganizationService.getMembersFromProject(this.psrId).subscribe({
      next: (data) => {
        // Si nous avons récupéré les dates du projet, on les applique à tous les membres
        if (this.projectStartDate && this.projectEndDate) {
          data.forEach(member => {
            member.plannedStartDate = this.projectStartDate;
            member.plannedEndDate = this.projectEndDate;
          });
        }
        this.teamMembers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des membres du projet', err);
        this.error = 'Impossible de charger les membres de l\'équipe. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
