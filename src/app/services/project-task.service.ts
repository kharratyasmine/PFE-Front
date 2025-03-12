import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectTask } from '../model/ProjectTask.model';
import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root'
})
export class ProjectTaskService {
  private apiUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.apiUrl}/${id}`);
  }

  createTask(task: ProjectTask): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(this.apiUrl, task);
  }

  updateTask(id: number, task: ProjectTask): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  downloadExcel(project: ProjectTask[]): Observable<Blob> {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(project);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return new Observable((observer) => {
          observer.next(blob);
          observer.complete();
        });
    }
}
