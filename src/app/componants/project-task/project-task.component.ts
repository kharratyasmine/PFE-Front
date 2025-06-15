import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ProjectGroup } from 'src/app/model/project-group.model';
import { ProjectTask, TaskStatus } from 'src/app/model/ProjectTask.model';
import { WorkEntry } from 'src/app/model/work-entry.model';
import { TaskService } from 'src/app/services/project-task.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { HolidayService } from 'src/app/services/holiday.service';

@Component({
  selector: 'app-project-task',
  templateUrl: './project-task.component.html',
  styleUrls: ['./project-task.component.css']
})
export class ProjectTaskComponent implements OnInit {
  projectId: number | null = null;
  projects: any[] = [];
  filteredMembers: any[] = [];
  itemsPerPage: number = 3;
  selectedTask: ProjectTask = this.createEmptyTask();
  selectedTaskDetails: ProjectTask | null = null;
  isEditMode = false;
  groupedTasks: ProjectGroup[] = [];
  private modalInstance!: any;
  private detailsModalInstance!: any;
  private workDayModalInstance!: any;

  // Exposer Math pour le template
  Math = Math;

  // Données pour le calendrier de travail
  memberWorkEntries: WorkEntry[] = [];

  selectedAssignment: any = null;
  selectedWorkDate: string = '';
  selectedWorkStatus: number = 0;
  selectedWorkComment: string = '';

  statusList = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.BLOCKED
  ];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private teamMemberService: TeamMemberService,
    private holidayService: HolidayService
  ) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;

      if (this.projectId && !isNaN(this.projectId)) {
        this.loadCurrentProjectTasks();
        this.loadMembersByProject(this.projectId);
      } else {
        console.error("❌ projectId invalide ou absent dans l'URL", idParam);
      }
    });
  }

  loadCurrentProjectTasks(): void {
    if (!this.projectId) return;

    this.projectService.getProjectById(this.projectId).subscribe(proj => {
      this.projects = [proj];
      this.groupedTasks = [{
        projectId: proj.id ?? null,
        projectName: proj.name,
        tasks: [],
        filteredTasks: [],
        currentPage: 1
      }];

      this.taskService.getTasksByProject(this.projectId!).subscribe(tasks => {
        console.log('📦 Tâches reçues:', tasks);
        this.groupedTasks[0].tasks = tasks;
        this.groupedTasks[0].filteredTasks = tasks;

        // Charger les work entries pour chaque tâche
        tasks.forEach(task => {
          if (!task.id || !task.assignments) return;

          this.taskService.getWorkEntriesByTask(task.id).subscribe(entries => {
            task.assignments.forEach(assignment => {
              const memberEntries = entries.filter(e => e.memberId === assignment.teamMemberId);

              // 💡 Nouveau calcul basé sur status = number
              const totalMD = memberEntries.reduce((sum, entry) => {
                const s = typeof entry.status === 'number' ? entry.status : 0;
                return sum + s;
              }, 0);
              assignment.workedMD = parseFloat(totalMD.toFixed(2));

              // 🔁 Dates effectives (filtrer les entrées ayant status > 0)
              const validEntries = memberEntries.filter(e => e.status && Number(e.status) > 0);
              validEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              if (validEntries.length > 0) {
                assignment.effectiveStartDate = validEntries[0].date;
                assignment.effectiveEndDate = validEntries[validEntries.length - 1].date;
              }

              // ✅ Calcul du reste même si négatif
              assignment.remainingMD = parseFloat((assignment.estimatedMD - assignment.workedMD).toFixed(2));
            });
          });
        });
      });
    });
  }

  loadMembersByProject(projectId: number | null): void {
    if (!projectId) {
      this.filteredMembers = [];
      return;
    }

    this.projectService.getMembersByProject(projectId).subscribe(
      (data) => {
        console.log('🚀 Membres reçus:', data);
        // ✅ Supprimer les doublons par ID
        this.filteredMembers = data.filter(
          (m, index, self) => index === self.findIndex((x) => x.id === m.id)
        );
      },
      (error) => {
        console.error('Erreur chargement membres:', error);
        alert("Erreur lors du chargement des membres.");
      }
    );
  }

  getMemberName(memberId: number | null): string {
    const member = this.filteredMembers.find(m => m.id === memberId);
    return member ? member.name : 'Inconnu';
  }

  recalculateRemainingMD(assignment: any): void {
    if (assignment.estimatedMD != null && assignment.workedMD != null) {
      assignment.remainingMD = assignment.estimatedMD - assignment.workedMD;
    } else {
      assignment.remainingMD = 0;
    }
  }

  openModal(task?: ProjectTask, projectId?: number): void {
    this.isEditMode = !!task;
    this.selectedTask = task ? { ...task } : this.createEmptyTask();
    this.selectedTask.projectId = projectId ?? this.projectId;
    this.selectedTask.assignments.forEach(a => this.recalculateRemainingMD(a));

    this.loadMembersByProject(this.selectedTask.projectId);

    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.selectedTask = this.createEmptyTask();
  }

  openDetailsModal(task: ProjectTask): void {
    this.selectedTaskDetails = { ...task };

    // Chargement des entrées de travail pour cette tâche
    if (task.id) {
      this.taskService.getWorkEntriesByTask(task.id).subscribe({
        next: (entries) => {
          this.memberWorkEntries = entries;

          // Mise à jour immédiate des MD travaillés pour chaque assignation
          if (this.selectedTaskDetails && this.selectedTaskDetails.assignments) {
            this.selectedTaskDetails.assignments.forEach(assignment => {
              // Calculer les MD travaillés
              const totalMD = this.calculateTotalMD(assignment.teamMemberId);
              assignment.workedMD = totalMD;

              // Recalculer le MD restant
              this.recalculateRemainingMD(assignment);

              // Mettre à jour les dates effectives si nécessaire
              this.updateEffectiveDates(assignment);
            });

            // Forcer le rafraîchissement de la vue
            this.selectedTaskDetails = { ...this.selectedTaskDetails };
          }

          // Afficher la modal après le chargement des données
          this.showDetailsModal();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des entrées de travail:', error);
          // Afficher la modal même en cas d'erreur
          this.showDetailsModal();
        }
      });
    } else {
      this.showDetailsModal();
    }
  }

  // Méthode pour afficher la modal (extraite pour éviter la duplication)
  private showDetailsModal(): void {
    const modalElement = document.getElementById('detailsModal');
    if (modalElement) {
      this.detailsModalInstance = new bootstrap.Modal(modalElement);
      this.detailsModalInstance.show();
    }
  }

  // Nouvelle méthode pour mettre à jour automatiquement les dates effectives
  updateEffectiveDates(assignment: any): void {
    if (!assignment) return;

    // Récupérer toutes les entrées de travail pour ce membre et cette tâche
    const memberEntries = this.memberWorkEntries.filter(
      entry => entry.memberId === assignment.teamMemberId && entry.status !== 0
    );

    if (memberEntries.length > 0) {
      // Trier les entrées par date
      memberEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // La première date de travail devient la date effective de début
      const firstWorkDate = memberEntries[0].date;
      if (!assignment.effectiveStartDate || new Date(firstWorkDate) < new Date(assignment.effectiveStartDate)) {
        assignment.effectiveStartDate = firstWorkDate;
      }

      // La dernière date de travail devient la date effective de fin
      const lastWorkDate = memberEntries[memberEntries.length - 1].date;
      if (!assignment.effectiveEndDate || new Date(lastWorkDate) > new Date(assignment.effectiveEndDate)) {
        assignment.effectiveEndDate = lastWorkDate;
      }
    }
  }

  closeDetailsModal(): void {
    if (this.detailsModalInstance) {
      this.detailsModalInstance.hide();
    }
    this.selectedTaskDetails = null;
  }

  // MÉTHODES POUR LE CALENDRIER DE TRAVAIL
  openWorkDayModal(assignment: any): void {
    this.selectedAssignment = assignment;
    this.selectedWorkDate = new Date().toISOString().split('T')[0];
    this.selectedWorkStatus = 0;
    this.selectedWorkComment = '';

    const modalElement = document.getElementById('workDayModal');
    if (modalElement) {
      this.workDayModalInstance = new bootstrap.Modal(modalElement);
      this.workDayModalInstance.show();
    }
  }

  closeWorkDayModal(): void {
    if (this.workDayModalInstance) {
      this.workDayModalInstance.hide();
    }
  }

  saveWorkDay(): void {
    if (!this.selectedAssignment || !this.selectedWorkDate || !this.selectedTaskDetails?.id) {
      return;
    }

    const workEntry: WorkEntry = {
      memberId: this.selectedAssignment.teamMemberId,
      taskId: this.selectedTaskDetails.id,
      date: this.selectedWorkDate,
      status: this.selectedWorkStatus,
      comment: this.selectedWorkComment
    };

    // Recherche d'une entrée existante
    const existingEntryIndex = this.memberWorkEntries.findIndex(
      entry => entry.memberId === workEntry.memberId &&
        entry.date === workEntry.date
    );

    if (existingEntryIndex >= 0) {
      // Mise à jour d'une entrée existante avec son ID
      workEntry.id = this.memberWorkEntries[existingEntryIndex].id;
    }

    // Sauvegarder dans la base de données
    this.taskService.saveWorkEntry(workEntry).subscribe({
      next: (savedEntry) => {
        // Mettre à jour ou ajouter localement
        if (existingEntryIndex >= 0) {
          this.memberWorkEntries[existingEntryIndex] = savedEntry;
        } else {
          this.memberWorkEntries.push(savedEntry);
        }

        // Gérer les congés
        this.manageHolidayEntry(
          this.selectedAssignment.teamMemberId,
          this.selectedWorkDate,
          this.selectedWorkStatus
        );

        // Recalculer + sauvegarder dans la base
        this.updateWorkedMD(this.selectedAssignment);
        this.updateEffectiveDates(this.selectedAssignment);
        this.updateTaskAssignment(this.selectedAssignment);

        // ⚠️ Mise à jour de selectedTaskDetails pour que l'affichage se rafraîchisse automatiquement
        this.taskService.getTaskById(this.selectedTaskDetails!.id!).subscribe(task => {
          this.selectedTaskDetails = task;

          this.taskService.getWorkEntriesByTask(task.id!).subscribe(entries => {
            this.memberWorkEntries = entries;

            // Recalculer les valeurs pour chaque assignation
            this.selectedTaskDetails!.assignments.forEach(a => {
              this.updateWorkedMD(a);
              this.updateEffectiveDates(a);
            });

            // Forcer mise à jour Angular
            this.selectedTaskDetails = {
              id: task.id!,
              name: task.name || '',
              description: task.description || '',
              dateDebut: task.dateDebut || '',
              dateFin: task.dateFin || '',
              status: task.status || TaskStatus.TODO,
              progress: task.progress || 0,
              projectId: task.projectId!,
              projectName: task.projectName || '',
              assignments: task.assignments || []
            };


            // Rafraîchir la liste principale aussi
            if (this.projectId) {
              this.loadCurrentProjectTasks();
            }

            this.closeWorkDayModal();
          });
        });
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde de l\'entrée de travail:', error);
        alert('Erreur lors de la sauvegarde de l\'entrée de travail.');
      }
    });
  }

  getWorkingDays(startDateStr?: string, endDateStr?: string): Date[] {
    if (!startDateStr || !endDateStr) {
      return [];
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const days: Date[] = [];

    // Vérifier les dates valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }

    // Générer les jours entre startDate et endDate
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Filtrer les weekends (0 = Dimanche, 6 = Samedi)
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) {
        days.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
  }

  getMemberWorkStatus(memberId: number | null, date: Date): number {
    if (!memberId) return 0;

    const dateStr = date.toISOString().split('T')[0];
    const entry = this.memberWorkEntries.find(
      e => e.memberId === memberId && e.date === dateStr
    );

    return entry ? Number(entry.status) : 0;
  }

  setMemberWorkStatus(memberId: number | null, date: Date, status: number): void {
    if (!memberId || !this.selectedTaskDetails?.id) return;

    const dateStr = date.toISOString().split('T')[0];

    const workEntry: WorkEntry = {
      memberId,
      taskId: this.selectedTaskDetails.id,
      date: dateStr,
      status
    };

    const entryIndex = this.memberWorkEntries.findIndex(
      e => e.memberId === memberId && e.date === dateStr
    );

    if (entryIndex >= 0) {
      workEntry.id = this.memberWorkEntries[entryIndex].id;
    }

    this.taskService.saveWorkEntry(workEntry).subscribe({
      next: (savedEntry) => {
        if (entryIndex >= 0) {
          this.memberWorkEntries[entryIndex] = savedEntry;
        } else {
          this.memberWorkEntries.push(savedEntry);
        }

        this.manageHolidayEntry(memberId, dateStr, savedEntry.status);
        const assignment = this.selectedTaskDetails?.assignments.find(a => a.teamMemberId === memberId);
        if (assignment) {
          this.updateWorkedMD(assignment);
          this.updateEffectiveDates(assignment);
          this.updateTaskAssignment(assignment);
          this.loadCurrentProjectTasks();
        }
      },
      error: (error) => console.error('Erreur maj statut de travail:', error)
    });
  }

  manageHolidayEntry(memberId: number, dateStr: string, status: number): void {
    if (status === 0) {
      // Congé total
      this.holidayService.addSimpleHoliday(memberId, dateStr).subscribe({
        next: () => console.log(`✅ Congé TOTAL ajouté pour le membre ${memberId} à ${dateStr}`),
        error: (error) => console.error('Erreur ajout congé total:', error)
      });
    } else if (status === 0.5 || status === 0.25 || status === 0.75) {
      // Congé partiel
      const label = status === 0.5 ? 'Demi-journée' : status === 0.25 ? 'Quart' : 'Trois-quarts';
      this.holidayService.addPartialHoliday(memberId, dateStr, label).subscribe({
        next: () => console.log(`✅ Congé ${label} ajouté pour ${memberId} à ${dateStr}`),
        error: (error) => console.error(`Erreur ajout congé ${label}:`, error)
      });
    } else {
      // Si jour normal travaillé, supprimer congé s'il existe
      this.holidayService.checkHolidayForMember(memberId, dateStr).subscribe({
        next: (exists) => {
          if (exists) {
            this.holidayService.deleteHolidayRobust(memberId, dateStr).subscribe({
              next: () => console.log(`❌ Congé supprimé pour ${memberId} à ${dateStr}`),
              error: (err) => {
                console.error('Erreur suppression congé:', err);
                alert('Impossible de supprimer le congé existant');
              }
            });
          }
        },
        error: (error) => console.error('Erreur vérification congé:', error)
      });
    }
  }

  // Mettre à jour l'assignation dans la base de données
  updateTaskAssignment(assignment: any): void {
    if (!this.selectedTaskDetails || !this.selectedTaskDetails.id) return;

    // Log des détails avant la mise à jour
    console.log('Mise à jour de la tâche:', this.selectedTaskDetails.id);
    console.log('Assignment avant mise à jour:', JSON.stringify(assignment));

    // S'assurer que les valeurs numériques sont bien des nombres (et non des chaînes)
    assignment.workedMD = Number(assignment.workedMD);
    assignment.estimatedMD = Number(assignment.estimatedMD);
    assignment.remainingMD = Number(assignment.remainingMD);

    // Vérification explicite des valeurs pour débogage
    console.log(`Valeurs numériques converties: workedMD=${assignment.workedMD}, estimatedMD=${assignment.estimatedMD}, remainingMD=${assignment.remainingMD}`);

    // Si l'assignation a un ID, on peut utiliser l'endpoint spécialisé pour mettre à jour uniquement workedMD
    if (assignment.id) {
      this.taskService.updateAssignmentWorkedMD(this.selectedTaskDetails.id, assignment.id, assignment.workedMD).subscribe({
        next: (response) => {
          console.log(`Mise à jour de workedMD réussie via l'endpoint spécialisé:`, response);
        },
        error: (error) => {
          console.error(`Erreur lors de la mise à jour de workedMD via l'endpoint spécialisé:`, error);

          // En cas d'erreur, tomber sur la méthode standard de mise à jour
          this.updateFullTask();
        }
      });
    } else {
      // Mise à jour de la tâche complète si l'assignation n'a pas d'ID
      this.updateFullTask();
    }
  }

  // Méthode pour mettre à jour la tâche complète
  private updateFullTask(): void {
    if (!this.selectedTaskDetails || !this.selectedTaskDetails.id) return;

    // Créer une copie typée de la tâche pour s'assurer que toutes les propriétés sont correctement envoyées
    const taskToUpdate: ProjectTask = {
      id: this.selectedTaskDetails.id,
      name: this.selectedTaskDetails.name || '',
      description: this.selectedTaskDetails.description || '',
      dateDebut: this.selectedTaskDetails.dateDebut || '',
      dateFin: this.selectedTaskDetails.dateFin || '',
      status: this.selectedTaskDetails.status,
      progress: this.selectedTaskDetails.progress,
      projectId: this.selectedTaskDetails.projectId,
      assignments: [...(this.selectedTaskDetails.assignments || [])]
    };

    // On met à jour toute la tâche
    this.taskService.updateTask(this.selectedTaskDetails.id, taskToUpdate).subscribe({
      next: (updatedTask) => {
        console.log('Tâche mise à jour avec succès');
        console.log('Réponse du serveur:', updatedTask);

        // Mettre à jour les données locales avec la réponse du serveur
        if (updatedTask && updatedTask.assignments) {
          // Mettre à jour les données locales si nécessaire
          this.selectedTaskDetails = updatedTask;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
      }
    });
  }

  countMemberWorkDays(memberId: number | null, statusValue: number): number {
    if (!memberId) return 0;

    return this.memberWorkEntries.filter(
      e => e.memberId === memberId && Number(e.status) === statusValue
    ).length;
  }

  calculateTotalMD(memberId: number | null): number {
    if (!memberId) return 0;

    const total = this.memberWorkEntries
      .filter(e => e.memberId === memberId)
      .reduce((sum, e) => sum + (typeof e.status === 'number' ? e.status : 0), 0);

    return parseFloat(total.toFixed(2));
  }

  updateWorkedMD(assignment: any): void {
    if (!assignment) return;

    const totalMD = this.calculateTotalMD(assignment.teamMemberId);
    const oldValue = assignment.workedMD;
    assignment.workedMD = totalMD;

    // Recalcul du MD restant
    this.recalculateRemainingMD(assignment);

    // ✅ Calcul du pourcentage de progression
    if (assignment.estimatedMD && assignment.estimatedMD > 0) {
      assignment.progress = parseFloat(((assignment.workedMD / assignment.estimatedMD) * 100).toFixed(2));
    } else {
      assignment.progress = 0;
    }
    // ➕ Mettre à jour dynamiquement le statut
    if (this.selectedTaskDetails) {
      if (assignment.progress === 100) {
        this.selectedTaskDetails.status = TaskStatus.DONE;
      } else if (assignment.progress > 0) {
        this.selectedTaskDetails.status = TaskStatus.IN_PROGRESS;
      } else {
        this.selectedTaskDetails.status = TaskStatus.TODO;
      }
    }
    console.log(`Progression calculée : ${assignment.progress}%`);

    if (oldValue !== totalMD && this.selectedTaskDetails?.id) {
      this.updateTaskAssignment(assignment);
    }
  }

  // Avant de sauvegarder la tâche, mettre à jour toutes les valeurs calculées
  updateAllCalculatedValues(): void {
    if (!this.selectedTask || !this.selectedTask.assignments) return;

    this.selectedTask.assignments.forEach(assignment => {
      if (assignment.teamMemberId) {
        const totalMD = this.calculateTotalMD(assignment.teamMemberId);
        assignment.workedMD = totalMD;
        this.recalculateRemainingMD(assignment);

        // ✅ Mise à jour du progrès
        if (assignment.estimatedMD && assignment.estimatedMD > 0) {
          assignment.progress = parseFloat(((assignment.workedMD / assignment.estimatedMD) * 100).toFixed(2));
        } else {
          assignment.progress = 0;
        }

        this.updateEffectiveDates(assignment);
      }
    });
  }

  // Modifier la méthode saveTask pour mettre à jour les valeurs calculées avant sauvegarde
  saveTask(): void {
    if (!this.selectedTask) return;

    const taskStartDate = new Date(this.selectedTask.dateDebut);
    const taskEndDate = new Date(this.selectedTask.dateFin);
    if (taskStartDate >= taskEndDate) {
      alert("❌ La date de début doit être avant la date de fin.");
      return;
    }

    // Vérification des dates des affectations
    for (const a of this.selectedTask.assignments) {
      if (a.estimatedStartDate && a.estimatedEndDate) {
        const estStart = new Date(a.estimatedStartDate);
        const estEnd = new Date(a.estimatedEndDate);
        if (estStart >= estEnd) {
          alert("❌ Estimation de dates invalide.");
          return;
        }
      }

      if (a.effectiveStartDate && a.effectiveEndDate) {
        const effStart = new Date(a.effectiveStartDate);
        const effEnd = new Date(a.effectiveEndDate);
        if (effStart >= effEnd) {
          alert("❌ Dates effectives invalides.");
          return;
        }
      }
    }

    if (!this.selectedTask.projectId) {
      alert("❌ Aucun projet sélectionné !");
      return;
    }

    // ✅ Validation : la date de fin de la tâche ne doit pas dépasser la date de fin du projet
    this.projectService.getProjectById(this.selectedTask.projectId).subscribe({
      next: (project) => {
        if (project && project.endDate) {
          const projectEndDate = new Date(project.endDate);
          const taskEndDate = new Date(this.selectedTask.dateFin);

          if (taskEndDate > projectEndDate) {
            alert("❌ La date de fin de la tâche ne peut pas dépasser la date de fin du projet.");
            return; // Arrête le processus de sauvegarde
          }
        }

        // Si la validation passe ou si la date de fin du projet n'est pas définie, continuer la sauvegarde
        this.updateAllCalculatedValues();

        const request = this.isEditMode
          ? this.taskService.updateTask(this.selectedTask.id!, this.selectedTask)
          : this.taskService.createTaskForProject(this.projectId!, this.selectedTask);

        request.subscribe({
          next: () => {
            // ✅ Recharge les données
            this.loadCurrentProjectTasks();

            // ✅ Si on édite une tâche déjà ouverte dans la modale, il faut aussi mettre à jour selectedTaskDetails
            if (this.selectedTaskDetails?.id === this.selectedTask.id) {
              this.taskService.getTaskById(this.selectedTask.id!).subscribe(task => {
                this.selectedTaskDetails = {
                  id: task.id!,
                  name: task.name || '',
                  description: task.description || '',
                  dateDebut: task.dateDebut || '',
                  dateFin: task.dateFin || '',
                  status: task.status || TaskStatus.TODO,
                  progress: task.progress || 0,
                  projectId: task.projectId!,
                  projectName: task.projectName || '',
                  assignments: task.assignments || []
                };
              });
            }

            this.closeModal();
          },
          error: error => {
            alert("❌ Erreur lors de l'enregistrement.");
            console.error(error);
          }
        });

      },
      error: (error) => {
        console.error('Erreur lors du chargement du projet pour validation:', error);
        alert("❌ Erreur lors de la vérification de la date de fin du projet.");
        // On pourrait choisir de ne pas bloquer la sauvegarde ici ou de la bloquer
        // Pour l'instant, on affiche une alerte mais on ne bloque pas la sauvegarde si le projet ne peut pas être chargé.
        // Si vous voulez bloquer la sauvegarde en cas d'erreur de chargement, ajoutez un `return;` ici.
      }
    });
  }

  deleteTask(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.loadCurrentProjectTasks(),   // ✅ fonctionnera sans erreur
        error: (error) => {
          console.error('Erreur suppression', error);
          alert("Erreur lors de la suppression !");
        }
      });

    }
  }

  downloadExcel(): void {
    this.taskService.downloadExcel(this.projects).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error => console.error('Erreur lors du téléchargement Excel :', error)
    );
  }

  createEmptyTask(): ProjectTask {
    return {
      id: undefined,
      name: '',
      description: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0],
      status: TaskStatus.TODO,
      progress: 0,
      projectId: this.projectId,
      assignments: []
    };
  }

  getStatusLabel(status: TaskStatus | string): string {
    switch (status) {
      case TaskStatus.TODO: return 'TODO';
      case TaskStatus.IN_PROGRESS: return 'In_progress';
      case TaskStatus.DONE: return 'Done';
      case TaskStatus.BLOCKED: return 'Blocked';
      default: return '';
    }
  }

  onSearchChange(groupIndex: number, event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    const group = this.groupedTasks[groupIndex];
    group.filteredTasks = group.tasks.filter(task =>
      task.name.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );
    group.currentPage = 1;
  }

  onPageChange(groupIndex: number, page: number): void {
    this.groupedTasks[groupIndex].currentPage = page;
  }

  // Charger les entrées de travail pour une tâche
  loadWorkEntriesForTask(taskId: number): void {
    this.taskService.getWorkEntriesByTask(taskId).subscribe({
      next: (entries) => {
        this.memberWorkEntries = entries;

        // Mise à jour des MD travaillés pour chaque assignation
        if (this.selectedTaskDetails && this.selectedTaskDetails.assignments) {
          this.selectedTaskDetails.assignments.forEach(assignment => {
            this.updateWorkedMD(assignment);
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des entrées de travail:', error);
      }
    });
  }

  addWorkDayOutsideRange(assignment: any): void {
    this.selectedAssignment = assignment;
    this.selectedWorkDate = new Date().toISOString().split('T')[0]; // par défaut : aujourd'hui
    this.selectedWorkStatus = 1; // valeur initiale
    this.selectedWorkComment = '';

    const modal = document.getElementById('workDayModal');
    if (modal) {
      this.workDayModalInstance = new bootstrap.Modal(modal);
      this.workDayModalInstance.show();
    }
  }

  getAllWorkedDays(assignment: any): Date[] {
    const estimatedDays = this.getWorkingDays(assignment.estimatedStartDate, assignment.estimatedEndDate);

    const extraDates = this.memberWorkEntries
      .filter(e => e.memberId === assignment.teamMemberId)
      .map(e => new Date(e.date))
      .filter(date =>
        !estimatedDays.some(d => d.toDateString() === date.toDateString())
      );

    const allDates = [...estimatedDays, ...extraDates];

    // 🔹 Assurez-vous que tous les jours sont uniques (même si entrées dupliquées existent)
    const uniqueDates = allDates.filter((date, index, self) =>
      index === self.findIndex(d => d.toDateString() === date.toDateString())
    );

    // 🔹 Filtrez les weekends
    const nonWeekendDates = uniqueDates.filter(date => !this.isWeekend(date));

    // 🔹 Triez les dates pour affichage propre
    return nonWeekendDates.sort((a, b) => a.getTime() - b.getTime());
  }

  isOutOfEstimatedRange(day: Date, estimatedStartDate: string | null | undefined, estimatedEndDate: string | null | undefined): boolean {
    if (!estimatedStartDate || !estimatedEndDate) return false;
    const start = new Date(estimatedStartDate);
    const end = new Date(estimatedEndDate);
    return day < start || day > end;
  }

  onItemsPerPageChange(groupIndex: number): void {
    const group = this.groupedTasks[groupIndex];
    group.currentPage = 1; // Réinitialiser à la première page
  }
}