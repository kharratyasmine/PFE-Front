import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectTask } from '../model/ProjectTask.model';
import * as XLSX from 'xlsx';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks'; // URL de ton API

  constructor(private http: HttpClient) {}

  // ✅ Récupérer toutes les tâches
  getTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.apiUrl);
  }
  

  // ✅ Récupérer les tâches d'un projet spécifique
  getTasksByProject(projectId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // ✅ Récupérer une tâche par ID
  getTaskById(id: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.apiUrl}/${id}`);
  }

  // ✅ Ajouter une tâche
  createTask(task: ProjectTask): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(`${this.apiUrl}/project/${task.projectId}`, task);
  }
  
     downloadExcel(task: ProjectTask[]): Observable<Blob> {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(task);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return new Observable((observer) => {
          observer.next(blob);
          observer.complete();
        });
    }


    createTaskForProject(projectId: number, task: ProjectTask): Observable<ProjectTask> {
      return this.http.post<ProjectTask>(`${this.apiUrl}/project/${projectId}`, task);
    }
    
    updateTask(taskId: number, task: ProjectTask): Observable<ProjectTask> {
      return this.http.put<ProjectTask>(`${this.apiUrl}/${taskId}`, task);
    }
    
    deleteTask(taskId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${taskId}`);
    }
}
