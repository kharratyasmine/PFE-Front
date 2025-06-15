import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs';
import { Demande } from 'src/app/model/demande.model';
import { Devis } from 'src/app/model/devis.model';
import { Project } from 'src/app/model/project.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { ProjectSelectionService } from 'src/app/services/DashboardSelection.service';
import { ProjectService } from 'src/app/services/project.service';


@Component({
  selector: 'app-team-orga-dashboard',
  templateUrl: './team-orga-dashboard.component.html',
  styleUrls: ['./team-orga-dashboard.component.css']
})
export class TeamOrgaDashboardComponent implements OnInit, OnDestroy, OnChanges {
  selectedProject: Project | null = null;
  selectedDevis: Devis | null = null;
  private subscription = new Subscription();
  demandes: Demande[] = [];
  teamMembers: TeamMember[] = [];
  filteredTeamMembers: TeamMember[] = [];
  selectedMonth: Date = new Date();
  months: string[] = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  constructor(
    private projectSelectionService: ProjectSelectionService,
    private projectService: ProjectService
  ) { }

 ngOnInit() {
  // 1. Écoute le mois envoyé depuis TaskTimeSheets
  this.subscription.add(
    this.projectSelectionService.selectedMonth$.subscribe((month: Date | null) => {
      if (month) {
        this.selectedMonth = new Date(month);
        this.filterTeamMembersByMonth();
      }
    })
  );

  // 2. Ne remplace pas la date si elle a déjà été fixée
  this.subscription.add(
    this.projectSelectionService.selectedDevis$.subscribe((devis: Devis | null) => {
      this.selectedDevis = devis;
      if (devis) {
        const alreadySet = !!this.selectedMonth;
        if (!alreadySet) {
          this.updateSelectedMonthFromDevis(devis);
        }
      }
    })
  );

  // 3. Projet depuis localStorage
  const savedProject = localStorage.getItem('selectedProject');
  if (savedProject) {
    this.selectedProject = JSON.parse(savedProject);
    if (this.selectedProject?.id) {
      this.loadProjectData(this.selectedProject.id);
    }
  }

  // 4. Écoute projet sélectionné
  this.subscription.add(
    this.projectSelectionService.selectedProject$.subscribe((project: Project | null) => {
      this.selectedProject = project;
      if (project) {
        localStorage.setItem('selectedProject', JSON.stringify(project));
        if (project.id) {
          this.loadProjectData(project.id);
        }
      } else {
        this.teamMembers = [];
        this.filteredTeamMembers = [];
        localStorage.removeItem('selectedProject');
      }
    })
  );
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['selectedProject'] && this.selectedProject) {
    this.loadProjectData(this.selectedProject.id!);
  }
  // Trigger re-filtering if selectedDevis changes
  if (changes['selectedDevis']) {
    this.filterTeamMembersByMonth();
  }
}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

private loadProjectData(projectId: number) {
  console.log('Loading team members and demandes for project:', projectId);

  // Charger les membres
  this.projectService.getMembersByProject(projectId).subscribe({
    next: (members) => {
      this.teamMembers = members;
      console.log('Loaded members:', members);

      // Ensuite charger les demandes
      this.projectService.getDemandesByProject(projectId).subscribe({
        next: (demandes) => {
          this.demandes = demandes;
          console.log('Loaded demandes:', demandes);

          // Une fois les deux chargés, filtrer
          this.filterTeamMembersByMonth();
        },
        error: (err) => {
          console.error('Error loading demandes:', err);
          this.demandes = [];
          this.filterTeamMembersByMonth();
        }
      });
    },
    error: (error) => {
      console.error('Error loading team members:', error);
      this.teamMembers = [];
      this.filteredTeamMembers = [];
    }
  });
}



  private updateSelectedMonthFromDevis(devis: Devis) {
    if (devis.project?.startDate) {
      const startDate = new Date(devis.project.startDate);
      this.selectedMonth = startDate;
      this.filterTeamMembersByMonth();
    }
  }

  onMonthChange(month: Date) {
    this.selectedMonth = month;
    this.filterTeamMembersByMonth();
  }

 private filterTeamMembersByMonth() {
  if (!this.teamMembers.length || !this.demandes.length) {
    this.filteredTeamMembers = [];
    return;
  }

  const selectedYear = this.selectedMonth.getFullYear();
  const selectedMonthIndex = this.selectedMonth.getMonth();

  let membersToFilter: TeamMember[] = [];

  // Step 1: Filter members based on selected devis's demande_id
  console.log(`[DEBUG filterTeamMembersByMonth] selectedDevis:`, this.selectedDevis);
  if (this.selectedDevis && this.selectedDevis.demandeId) {
    console.log(`[DEBUG filterTeamMembersByMonth] Filtering by demandeId: ${this.selectedDevis.demandeId}`);
    const relatedDemande = this.demandes.find(d => d.id === this.selectedDevis?.demandeId);
    console.log(`[DEBUG filterTeamMembersByMonth] Found relatedDemande:`, relatedDemande);

    if (relatedDemande) {
      const memberIdsInDemande = new Set(relatedDemande.teamMemberIds || []);
      const fakeMemberNamesInDemande = new Set((relatedDemande.fakeMembers || []).map(fm => fm.name));

      membersToFilter = this.teamMembers.filter(member => {
        const isRealMember = member.id && memberIdsInDemande.has(member.id);
        const isFakeMember = fakeMemberNamesInDemande.has(member.name); // Assuming name is unique enough for fake members
        console.log(`[DEBUG filterTeamMembersByMonth] Member: ${member.name}, isRealMember: ${isRealMember}, isFakeMember: ${isFakeMember}`);
        return isRealMember || isFakeMember;
      });
      console.log(`[DEBUG filterTeamMembersByMonth] membersToFilter after devis filtering:`, membersToFilter);

    } else {
      // If devis selected but its demande not found, no members to show
      console.log(`[DEBUG filterTeamMembersByMonth] No related Demande found for devisId: ${this.selectedDevis.id} and demandeId: ${this.selectedDevis.demandeId}`);
      this.filteredTeamMembers = [];
      return;
    }
  } else {
    // If no devis selected or devis has no demandeId, consider all team members from the project
    console.log(`[DEBUG filterTeamMembersByMonth] No devis selected or no demandeId, showing all project members.`);
    membersToFilter = this.teamMembers;
  }

  // Step 2: Apply month filtering on the result of Step 1
  this.filteredTeamMembers = membersToFilter.map(member => {
    // Filter holidays
    const filteredHolidays = (member.holiday ?? []).filter(h => {
      const datePart = h.split('|')[0];
      const parsedDate = new Date(datePart);
      return !isNaN(parsedDate.getTime()) &&
             parsedDate.getFullYear() === selectedYear &&
             parsedDate.getMonth() === selectedMonthIndex;
    });

    // Find a relevant demande for this member within the selected month (for display fields)
    const demandeDuMois = this.demandes.find(demande => {
      const isMemberInThisDemande = (demande.teamMemberIds?.includes(member.id!) ||
                                    (demande.fakeMembers?.some(fm => fm.name === member.name && fm.role === member.role)));

      if (!isMemberInThisDemande) return false; // Member must be in this demande

      const debut = new Date(demande.dateDebut);
      const fin = new Date(demande.dateFin);

      console.log(`[DEBUG filterTeamMembersByMonth] Checking Demande ID: ${demande.id}, isMemberInThisDemande: ${isMemberInThisDemande}, Demande Dates: ${demande.dateDebut} - ${demande.dateFin}`);

      // Check if the demande period overlaps with the selected month
      const isMonthIncluded =
        (debut.getFullYear() < selectedYear || (debut.getFullYear() === selectedYear && debut.getMonth() <= selectedMonthIndex)) &&
        (fin.getFullYear() > selectedYear || (fin.getFullYear() === selectedYear && fin.getMonth() >= selectedMonthIndex));

      console.log(`[DEBUG filterTeamMembersByMonth] isMonthIncluded for Demande ID ${demande.id}: ${isMonthIncluded}`);

      return isMonthIncluded;
    });
    console.log(`[DEBUG filterTeamMembersByMonth] For member ${member.name}, found demandeDuMois:`, demandeDuMois);

    // Calculate allocation (existing logic, assumes it's project-wide or handled elsewhere for month)
    let allocation = 0;
    if (this.selectedProject?.id && member.allocationByTeamId) {
      const teamAllocation = member.allocationByTeamId[this.selectedProject.id];
      allocation = teamAllocation?.value ?? 0;
    } else {
      allocation = member.allocation ?? 0;
    }

    return {
      ...member,
      holiday: filteredHolidays,
      demandeStartDate: demandeDuMois?.dateDebut || undefined,
      demandeEndDate: demandeDuMois?.dateFin || undefined,
      allocation: allocation
    };
  });
}

getExportData(): { [key: string]: any }[] {
  return this.filteredTeamMembers.map(member => ({
    Initial: member.initial,
    Name: member.name,
    Role: member.role,
    StartDate: member.demandeStartDate,
    EndDate: member.demandeEndDate,
    Allocation: member.allocation ? member.allocation * 100 + '%' : '',
    Holidays: (member.holiday ?? []).map(h => h.split('|')[0]).join(', ')
  }));
}




  getHolidaysForMember(member: TeamMember): string[] {
    return member.holiday || [];
  }
}