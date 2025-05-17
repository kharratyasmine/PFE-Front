import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectTask } from '../model/ProjectTask.model';
import { WorkEntry } from '../model/work-entry.model';
import * as XLSX from 'xlsx';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks'; // URL de ton API
  private workEntriesUrl = 'http://localhost:8080/work-entries'; // URL pour les entrées de travail

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

  // Méthodes pour les entrées de travail (work entries)
  
  // Récupérer toutes les entrées de travail pour une tâche
  getWorkEntriesByTask(taskId: number): Observable<WorkEntry[]> {
    return this.http.get<WorkEntry[]>(`${this.workEntriesUrl}/task/${taskId}`);
  }
  
  // Récupérer toutes les entrées de travail pour un membre
  getWorkEntriesByMember(memberId: number): Observable<WorkEntry[]> {
    return this.http.get<WorkEntry[]>(`${this.workEntriesUrl}/member/${memberId}`);
  }
  
  // Récupérer toutes les entrées de travail pour un membre sur une tâche spécifique
  getWorkEntriesByMemberAndTask(memberId: number, taskId: number): Observable<WorkEntry[]> {
    return this.http.get<WorkEntry[]>(`${this.workEntriesUrl}/member/${memberId}/task/${taskId}`);
  }
  
  // Ajouter une entrée de travail
  createWorkEntry(workEntry: WorkEntry): Observable<WorkEntry> {
    return this.http.post<WorkEntry>(this.workEntriesUrl, workEntry);
  }
  
  // Mettre à jour une entrée de travail
  updateWorkEntry(id: number, workEntry: WorkEntry): Observable<WorkEntry> {
    return this.http.put<WorkEntry>(`${this.workEntriesUrl}/${id}`, workEntry);
  }
  
  // Supprimer une entrée de travail
  deleteWorkEntry(id: number): Observable<any> {
    return this.http.delete(`${this.workEntriesUrl}/${id}`);
  }
  
  // Créer ou mettre à jour une entrée de travail (upsert)
  saveWorkEntry(workEntry: WorkEntry): Observable<WorkEntry> {
    if (workEntry.id) {
      return this.updateWorkEntry(workEntry.id, workEntry);
    } else {
      return this.createWorkEntry(workEntry);
    }
  }
  updateAssignmentWorkedMD(taskId: number, assignmentId: number, workedMD: number) {
  return this.http.patch(`/tasks/${taskId}/assignment/${assignmentId}/workedMD`, { workedMD });
}



}
