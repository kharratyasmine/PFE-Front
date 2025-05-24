import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskTracker } from '../model/taskTracker.model';


@Injectable({
  providedIn: 'root'
})
export class TaskTrackerService {
  private apiUrl = `http://localhost:8080/task-tracker`;

  constructor(private http: HttpClient) {}

  getByPsr(psrId: number): Observable<TaskTracker[]> {
    return this.http.get<TaskTracker[]>(`${this.apiUrl}/psr/${psrId}`);
  }

  create(task: TaskTracker): Observable<TaskTracker> {
    return this.http.post<TaskTracker>(this.apiUrl, task);
  }

  updateTask(id: number, task: TaskTracker): Observable<TaskTracker> {
    return this.http.put<TaskTracker>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateFromAssignments(psrId: number): Observable<TaskTracker[]> {
    return this.http.post<TaskTracker[]>(`${this.apiUrl}/generate/${psrId}`, {});
  }

  calculateProgress(workedMD: number, estimatedMD: number): number {
    if (!estimatedMD || estimatedMD === 0) return 0;
    return Math.round((workedMD / estimatedMD) * 100);
  }

  calculateEffortVariance(estimatedMD: number, workedMD: number): number {
    if (!estimatedMD || estimatedMD === 0) return 0;
    return ((workedMD - estimatedMD) / estimatedMD) * 100;
  }
}