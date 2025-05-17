import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { PlannedWorkloadMember } from 'src/app/model/PlannedWorkloadMember.model';
import { Project } from 'src/app/model/project.model';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { ExcelService } from 'src/app/services/excel.service';
import { PlannedWorkloadMemberService } from 'src/app/services/PlannedWorkloadMember.Service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-planned-workload-member',
  templateUrl: './planned-workload-member.component.html',
  styleUrls: ['./planned-workload-member.component.css']
})
export class PlannedWorkloadMemberComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  selectedProjectId!: number;
  selected: PlannedWorkloadMember = this.emptyForm(); // 🟢 Pour le formulaire en bas
  projectId!: number; // 🟢 utile dans loadWorkloads
  workloads: PlannedWorkloadMember[] = []; // 🟢 stocke les données récupérées
  currentProject!: Project;

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthsMap: { [key: string]: number } = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  availableProjects: Project[] = [];
  members: TeamMember[] = [];
  editedWorkloads: { [memberId: number]: { [month: string]: number } } = {};
  selectedMember!: TeamMember;
  selectedMonth!: string;
  editedValue!: number;

  constructor(
    private route: ActivatedRoute,
    private workloadService: PlannedWorkloadMemberService,
    private projectService: ProjectService,
    private excelService: ExcelService
  ) { }
  memberId!: number;

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.projectId = +params['id'];
      this.selectedYear = new Date().getFullYear();

      this.projectService.getProjectById(this.projectId).subscribe({
        next: (project: Project) => {
          this.currentProject = project;
          this.loadPlannings(); // charger les workloads directement
        },
        error: (err) => console.error("Erreur chargement projet", err)
      });
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.availableProjects = projects;
      },
      error: (err) => {
        console.error("Erreur chargement projets :", err);
      }
    });
  }
  loadPlannings(): void {
    if (!this.projectId || !this.selectedYear) return;

    this.workloadService.getByProjectAndYear(this.projectId, this.selectedYear).subscribe({
        next: (data) => {
            // ✅ On garde TOUTES les workloads reçues (aucun filtrage par membre)
            this.workloads = data;

            this.editedWorkloads = {};
            this.members = [];

            this.projectService.getMembersByProject(this.projectId).subscribe({
                next: (teamMembers: TeamMember[]) => {
                    const uniqueMembers = new Map<number, TeamMember>();

                    // 🔄 Initialiser la structure pour CHAQUE membre
                    for (let member of teamMembers) {
                        if (!uniqueMembers.has(member.id!)) {
                            uniqueMembers.set(member.id!, member);
                            this.editedWorkloads[member.id!] = {
                                Jan: 0,
                                Feb: 0,
                                Mar: 0,
                                Apr: 0,
                                May: 0,
                                Jun: 0,
                                Jul: 0,
                                Aug: 0,
                                Sep: 0,
                                Oct: 0,
                                Nov: 0,
                                Dec: 0
                            };
                        }
                    }

                    this.members = Array.from(uniqueMembers.values());

                    // 🔄 Injecter toutes les workloads existantes dans la structure
                    for (let w of this.workloads) {
                        const monthIndex = +w.month; // convertit en nombre (ex : 5)
                        const monthLabel = this.months[monthIndex - 1]; // -1 car index commence à 0

                        if (monthLabel) {
                            // On met la valeur (remplace, pas additionne) pour éviter de fausser en cas de doublons
                            this.editedWorkloads[w.teamMemberId][monthLabel] = w.workload;
                        }
                    }
                },
                error: (err) => console.error("Erreur chargement membres équipe :", err)
            });
        },
        error: (err) => console.error("❌ Erreur chargement planning :", err)
    });
}



  loadWorkloads(): void {
    this.workloadService.getByMember(this.projectId, this.memberId).subscribe({
      next: (data) => this.workloads = data,
      error: (err) => console.error("❌ Erreur chargement des workloads", err)
    });
  }


  emptyForm(): PlannedWorkloadMember {
    return {
      month: '',
      year: new Date().getFullYear(),
      workload: 0,
      note: '',
      teamMemberId: this.memberId, // ✅ spécifique au membre
      projectId: this.projectId
    };
  }

  edit(workload: PlannedWorkloadMember): void {
    this.selected = { ...workload };
  }

  save(): void {
    if (this.selected.id) {
      this.workloadService.update(this.selected.id, this.selected).subscribe(() => this.loadWorkloads());
    } else {
      this.workloadService.create(this.selected).subscribe(() => this.loadWorkloads());
    }
    this.selected = this.emptyForm();
  }

  remove(id: number): void {
    if (confirm("Supprimer cette charge ?")) {
      this.workloadService.delete(id).subscribe(() => this.loadWorkloads());
    }
  }
  onProjectChange(): void {
    this.projectId = this.selected.projectId;
    this.loadWorkloads(); // 🔁 recharge les données
  }

  getTotalForMember(memberId: number): number {
    const months = this.editedWorkloads[memberId];
    return months ? Object.values(months).reduce((a, b) => a + (b || 0), 0) : 0;
  }
  savePlannedWorkloads(): void {
    const updates: PlannedWorkloadMember[] = [];

    for (const memberId in this.editedWorkloads) {
      for (const month of this.months) {
        const workload = this.editedWorkloads[memberId][month];
        if (workload != null) {
          updates.push({
            teamMemberId: +memberId,
            projectId: this.projectId,
            year: this.selectedYear,
            month: String(this.monthsMap[month]),
            workload,
            note: ''
          });
        }
      }
    }

    this.workloadService.bulkSave(updates).subscribe({
      next: () => {
        alert("✅ Planification enregistrée !");
        this.loadPlannings();
      },
      error: (err) => console.error("❌ Erreur enregistrement :", err)
    });
  }

  generateAutoWorkloads(): void {
    if (!this.projectId || !this.selectedYear) return;

    this.workloadService.generateWorkloads(this.projectId, this.selectedYear).subscribe({
      next: () => {
        alert('✅ Génération automatique réussie !');
        this.loadPlannings();
      },
      error: (err) => console.error('❌ Erreur lors de la génération automatique :', err)
    });
  }


  openEditModal(member: TeamMember, month: string): void {
    if (!member || !month) return;

    this.selectedMember = member;
    this.selectedMonth = month;

    if (!this.editedWorkloads[member.id!]) {
      this.editedWorkloads[member.id!] = {}; // 🔵 Initialise l'objet si vide
    }

    if (this.editedWorkloads[member.id!][month] == null) {
      this.editedWorkloads[member.id!][month] = 0; // 🔵 Initialise à 0 si vide
    }

    this.editedValue = this.editedWorkloads[member.id!][month];

    const modal = document.getElementById('editWorkloadModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  }


  saveEditedWorkload(): void {
    if (this.selectedMember && this.selectedMonth) {
      this.editedWorkloads[this.selectedMember.id!][this.selectedMonth] = this.editedValue;
      
      // Créer un objet pour l'enregistrement immédiat
      const workloadToSave: PlannedWorkloadMember = {
        teamMemberId: this.selectedMember.id!,
        projectId: this.projectId,
        year: this.selectedYear,
        month: String(this.monthsMap[this.selectedMonth]),
        workload: this.editedValue,
        note: ''
      };
      
      // Chercher si cette charge existe déjà dans les workloads chargés
      const existingWorkload = this.workloads.find(w => 
        w.teamMemberId === this.selectedMember.id! && 
        +w.month === this.monthsMap[this.selectedMonth] && 
        w.year === this.selectedYear
      );
      
      // Si elle existe, mettre à jour, sinon créer
      if (existingWorkload && existingWorkload.id) {
        workloadToSave.id = existingWorkload.id;
        this.workloadService.update(existingWorkload.id, workloadToSave).subscribe({
          next: () => {
            const modal = document.getElementById('editWorkloadModal');
            if (modal) bootstrap.Modal.getInstance(modal)?.hide();
          },
          error: (err) => console.error("❌ Erreur lors de la mise à jour :", err)
        });
      } else {
        this.workloadService.create(workloadToSave).subscribe({
          next: () => {
            const modal = document.getElementById('editWorkloadModal');
            if (modal) bootstrap.Modal.getInstance(modal)?.hide();
            this.loadPlannings(); // Recharger pour obtenir les IDs mis à jour
          },
          error: (err) => console.error("❌ Erreur lors de la création :", err)
        });
      }
    }
  }

  // Method to download workload data as Excel
  downloadExcel(): void {
    try {
      // First try to use the direct service method
      this.workloadService.exportToExcel(this.projectId, this.selectedYear).subscribe({
        next: (blob: Blob) => {
          this.downloadFile(blob, `planned_workload_${this.currentProject?.name || this.projectId}_${this.selectedYear}.xlsx`);
        },
        error: (err) => {
          console.error("Error downloading Excel from backend:", err);
          // Fallback to client-side generation
          this.generateExcelClientSide();
        }
      });
    } catch (error) {
      console.error("Error in Excel download:", error);
      // Fallback to client-side generation
      this.generateExcelClientSide();
    }
  }

  private generateExcelClientSide(): void {
    // Prepare data for Excel export
    const excelData: any[] = [];
    
    // Add header row with months
    const headerRow: any = {
      Resource: 'Resource',
      Role: 'Role'
    };
    
    this.months.forEach(month => {
      headerRow[month] = month;
    });
    
    headerRow['Total'] = 'Total';
    excelData.push(headerRow);
    
    // Add data for each member
    this.members.forEach(member => {
      const dataRow: any = {
        Resource: member.name,
        Role: member.role
      };
      
      this.months.forEach(month => {
        dataRow[month] = this.editedWorkloads[member.id!][month];
      });
      
      dataRow['Total'] = this.getTotalForMember(member.id!);
      excelData.push(dataRow);
    });
    
    // Generate and download Excel file
    const fileName = `planned_workload_${this.currentProject?.name || this.projectId}_${this.selectedYear}.xlsx`;
    this.excelService.exportToExcel(excelData, fileName);
  }

  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
