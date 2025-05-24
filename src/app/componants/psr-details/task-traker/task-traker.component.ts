import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TaskTracker } from 'src/app/model/taskTracker.model';
import { TaskTrackerService } from 'src/app/services/taskTracker.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-task-traker',
  templateUrl: './task-traker.component.html',
  styleUrls: ['./task-traker.component.css']
})
export class TaskTrakerComponent implements OnInit {

  @Input() psrId!: number;

  taskTrackers: TaskTracker[] = [];
  loading = false;
  error: string | null = null;
  taskForm!: FormGroup;
  selectedTask: TaskTracker | null = null;
  groupedTasksByWeek: { week: string, tasks: TaskTracker[] }[] = [];
  @ViewChild('editTaskModal') editTaskModalRef!: TemplateRef<any>;
  currentWeek: string = '';

  dynamicColumns = [
    { key: 'who', label: 'Who' },
    { key: 'week', label: 'Week' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'estimatedEndDate', label: 'Estimated End Date' },
    { key: 'effectiveEndDate', label: 'Effective End Date' },
    { key: 'estimatedMD', label: 'Estimated MD' },
    { key: 'workedMD', label: 'Worked MD' },
    { key: 'remainingMD', label: 'Remaining MD' },
    { key: 'progress', label: 'Progress' },
    { key: 'currentStatus', label: 'Current Status' },
    { key: 'effortVariance', label: 'Effort Variance' },
    { key: 'deviationReason', label: 'Deviation Reason' },
    { key: 'note', label: 'Note' },
  ];

  constructor(
    private taskService: TaskTrackerService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.initForm();
    this.setCurrentWeek();
  }

  private setCurrentWeek(): void {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    this.currentWeek = `W${weekNumber.toString().padStart(2, '0')}-${now.getFullYear()}`;
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      who: ['', Validators.required],
      week: [this.currentWeek, Validators.required],
      startDate: ['', Validators.required],
      estimatedEndDate: ['', Validators.required],
      effectiveEndDate: [''],
      estimatedMD: [0, [Validators.required, Validators.min(0)]],
      workedMD: [0, [Validators.required, Validators.min(0)]],
      remainingMD: [0, [Validators.required, Validators.min(0)]],
      currentStatus: ['Planifié', Validators.required],
      deviationReason: [''],
      note: ['']
    });

    // Ajouter des validateurs pour les dates
    this.taskForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });

    this.taskForm.get('estimatedEndDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  private validateDates(): void {
    const startDate = this.taskForm.get('startDate')?.value;
    const estimatedEndDate = this.taskForm.get('estimatedEndDate')?.value;
    const effectiveEndDate = this.taskForm.get('effectiveEndDate')?.value;

    if (startDate && estimatedEndDate && startDate > estimatedEndDate) {
      this.taskForm.get('estimatedEndDate')?.setErrors({ invalidDate: true });
    }

    if (effectiveEndDate && startDate && effectiveEndDate < startDate) {
      this.taskForm.get('effectiveEndDate')?.setErrors({ invalidDate: true });
    }
  }

  ngOnInit(): void {
    if (this.psrId) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getByPsr(this.psrId).subscribe({
      next: (data) => {
        this.taskTrackers = data;
        this.groupTasksByWeek();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des tâches';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private groupTasksByWeek(): void {
    const groups: { [week: string]: TaskTracker[] } = {};
    this.taskTrackers.forEach(task => {
      const week = task.week || 'Sans semaine';
      if (!groups[week]) {
        groups[week] = [];
      }
      groups[week].push(task);
    });

    this.groupedTasksByWeek = Object.keys(groups).map(week => ({
      week: week,
      tasks: groups[week]
    })).sort((a, b) => {
      // Trier les semaines dans l'ordre chronologique
      const [weekA, yearA] = a.week.split('-');
      const [weekB, yearB] = b.week.split('-');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return parseInt(weekA.substring(1)) - parseInt(weekB.substring(1));
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.taskTrackers = this.taskTrackers.filter(t => t.id !== taskId);
          this.groupTasksByWeek();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression de la tâche';
          console.error(err);
        }
      });
    }
  }

  openEditModal(task: TaskTracker): void {
    this.selectedTask = task;
    this.taskForm.patchValue({
      who: task.who,
      week: task.week,
      startDate: task.startDate,
      estimatedEndDate: task.estimatedEndDate,
      effectiveEndDate: task.effectiveEndDate,
      estimatedMD: task.estimatedMD,
      workedMD: task.workedMD,
      remainingMD: task.remainingMD,
      currentStatus: task.currentStatus,
      deviationReason: task.deviationReason,
      note: task.note
    });

    this.modalService.open(this.editTaskModalRef, { size: 'lg' });
  }

  saveTask(): void {
    if (this.taskForm.valid && this.selectedTask) {
      const formValue = this.taskForm.value;
      const updatedTask: TaskTracker = {
        ...this.selectedTask,
        ...formValue,
        progress: this.taskService.calculateProgress(formValue.workedMD, formValue.estimatedMD),
        effortVariance: this.taskService.calculateEffortVariance(formValue.estimatedMD, formValue.workedMD)
      };

      this.taskService.updateTask(this.selectedTask.id!, updatedTask).subscribe({
        next: (response) => {
          const index = this.taskTrackers.findIndex(t => t.id === response.id);
          if (index !== -1) {
            this.taskTrackers[index] = response;
          }
          this.groupTasksByWeek();
          this.modalService.dismissAll();
          this.selectedTask = null;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = 'Erreur lors de la mise à jour de la tâche';
        }
      });
    }
  }

  getWeekLabel(date: Date): string {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `W${weekNumber.toString().padStart(2, '0')}-${date.getFullYear()}`;
  }
}