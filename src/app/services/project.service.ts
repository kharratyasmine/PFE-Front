import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../model/project.model';
import * as XLSX from 'xlsx';
import { User } from '../model/user.model';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = 'http://localhost:8080/project'; 

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer tous les projets
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }
  // 🔹 Ajouter un projet
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>('http://localhost:8080/project', project, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }) // ✅ JSON
    });
  }
  
  // 🔹 Modifier un projet existant
  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }
  // 🔹 Supprimer un projet par ID
  deleteProject(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/project/${id}`, { responseType: 'text' }); // ✅ Ajout de { responseType: 'text' }
  }
  
  

    downloadExcel(project: Project[]): Observable<Blob> {
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
