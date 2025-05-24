import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Project } from '../model/project.model';
import * as XLSX from 'xlsx';
import { User } from '../model/user.model';
import { TeamMember } from '../model/TeamMember.model';
import { TeamAllocation, TeamMemberAllocation } from '../model/MemberAllocation.model';
import { Team } from '../model/Team.model';
import { ProjectDTO } from '../model/project.model'; // ✅ si tu as mis DTO dans le même fichier
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = 'http://localhost:8080/projects';
  private teamApiUrl = 'http://localhost:8080/teams';
  private allocationApiUrl = 'http://localhost:8080/allocations';



  constructor(private http: HttpClient) { }

  // 🔹 Récupérer tous les projets
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    console.error("❌ Erreur API :", error);
    return throwError(() => new Error("Erreur lors de la récupération des projets."));
  }
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, project: ProjectDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, project);
  }

  createProject(project: ProjectDTO): Observable<any> {
    return this.http.post(this.apiUrl, project);
  }

  // 👥 Récupérer les membres d'une équipe
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${teamId}`);
  }


  // 🔹 Supprimer un projet par ID
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression du projet:', error);
        return throwError(() => new Error('Erreur lors de la suppression du projet'));
      })
    );
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

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>('http://localhost:8080/teams');
  }


  assignTeamToProject(projectId: number, teamId: number): Observable<any> {
    return this.http.put(`http://localhost:8080/projects/${projectId}/add-team/${teamId}`, {});
  }



  getAllocationEntity(memberId: number, projectId: number) {
    return this.http.get<TeamMemberAllocation>(
      `http://localhost:8080/allocations/entity?memberId=${memberId}&projectId=${projectId}`
    );
  }

  updateAllocation(id: number, allocation: any) {
    return this.http.put(`${this.apiUrl}/allocations/${id}`, allocation);
  }

  createAllocation(allocation: any): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/allocations`, allocation);
  }



  deleteAllocation(id: number) {
    return this.http.delete(`${this.allocationApiUrl}/${id}`);
  }

  getAllocations(projectId: number): Observable<TeamMemberAllocation[]> {
    return this.http.get<TeamMemberAllocation[]>(`${this.apiUrl}/${projectId}/allocations`);
  }


  getTeamAllocations(projectId: number): Observable<TeamAllocation[]> {
    return this.http.get<TeamAllocation[]>(`${this.apiUrl}/${projectId}/team-allocations`);
  }

  updateTeam(team: Team) {
    return this.http.put<Team>(`${this.apiUrl}/teams/${team.id}`, team);
  }

  removeTeamFromProject(projectId: number, teamId: number) {
    return this.http.delete(`http://localhost:8080/projects/${projectId}/teams/${teamId}`);
  }


  // 🔹 Récupérer les membres disponibles à ajouter à une équipe
  getAvailableTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`http://localhost:8080/teams/${teamId}/available-members`);
  }


  removeMemberFromTeam(teamId: number, memberId: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/teams/${teamId}/remove-member/${memberId}`);
  }



  // 🔹 Ajouter un membre à une équipe
  addMemberToTeam(teamId: number, memberId: number): Observable<any> {
    return this.http.put(`${this.teamApiUrl}/${teamId}/add-member/${memberId}`, {});
  }
  
  getMembersByProject(projectId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`http://localhost:8080/projects/${projectId}/members`);
  }
  

}
