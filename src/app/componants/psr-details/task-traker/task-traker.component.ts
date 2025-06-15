import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TaskTracker } from 'src/app/model/taskTracker.model';
import { TaskTrackerService } from 'src/app/services/taskTracker.service';
import { PsrService } from 'src/app/services/psr.service';
import { Psr } from 'src/app/model/psr.model';

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
  groupedTasksByWeek: { week: string, tasks: TaskTracker[] }[] = [];
  
  psrWeek: string = '';
  editingTaskId: number | null = null;

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
    private psrService: PsrService
  ) {
  }

  ngOnInit(): void {
    if (this.psrId) {
      this.loading = true;
      this.error = null;

      this.psrService.getById(this.psrId).subscribe({
        next: (psr: Psr) => {
          this.psrWeek = psr.week || '';
          this.loadTaskTrackers();
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to load PSR details.';
          console.error('Error loading PSR details:', err);
          this.loadTaskTrackers();
        }
      });

    }
  }

  loadTaskTrackers(): void {
    if (!this.psrId) return;
    this.loading = true;
    this.error = null;

    this.taskService.getByPsr(this.psrId).subscribe({
      next: (data) => {
        this.taskTrackers = data;
        this.groupTasksByWeek();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load task trackers.';
        console.error('Error loading task trackers:', err);
      }
    });
  }

groupTasksByWeek(): void {
    const filteredTasks = this.taskTrackers.filter(task => task.week === this.psrWeek);  // << FILTRE ICI

    const grouped = filteredTasks.reduce((acc, task) => {
      const week = task.week || 'No Week';
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(task);
      return acc;
    }, {} as { [key: string]: TaskTracker[] });

    this.groupedTasksByWeek = Object.keys(grouped).map(week => ({ week, tasks: grouped[week] }));
}


  startEditing(task: TaskTracker): void {
    this.editingTaskId = task.id || null;
  }

  saveTask(task: TaskTracker): void {
    if (task.id === undefined || task.id === null) {
        console.error('Task ID is undefined or null, cannot save.');
        this.error = 'Impossible de sauvegarder : ID de tâche manquant.';
        return;
    }

    console.log('Attempting to save task with ID:', task.id);

    this.loading = true;
    this.taskService.updateTask(task.id, task).subscribe({
      next: (updatedTask) => {
        console.log('Task updated successfully:', updatedTask);
        this.editingTaskId = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.error = 'Failed to save task.';
        this.loading = false;
      }
    });
  }
}