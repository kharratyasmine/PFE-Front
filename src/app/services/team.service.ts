import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import * as XLSX from 'xlsx';

import { TeamMember } from '../model/TeamMember.model';
import { Project } from '../model/project.model';

import { Team } from '../model/Team.model';
@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:8080/teams'; // ✅ Assure-toi que cette URL est correcte

  constructor(private http: HttpClient) { }


  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  createTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  updateTeam(id: number, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, team);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un membre à l'équipe
  addMemberToTeam(teamId: number, memberId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/add-member/${memberId}`, {});
  }

  // Retirer un membre de l'équipe
  removeMemberFromTeam(teamId: number, memberId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/remove-member/${memberId}`, {});
  }

  // Associer un projet à l'équipe
  addProjectToTeam(teamId: number, projectId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/add-project/${projectId}`, {});
  }

  // Retirer un projet de l'équipe
  removeProjectFromTeam(teamId: number, projectId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/remove-project/${projectId}`, {});
  }

  downloadExcel(team: Team[]): Observable<Blob> {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(team);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return new Observable((observer) => {
      observer.next(blob);
      observer.complete();
    });
  }
  getAllocation(memberId: number, projectId: number): Observable<{ allocation: number }> {
    return this.http.get<{ allocation: number }>(`${this.apiUrl}/allocation/${memberId}/${projectId}`);
  }
  
  updateAllocation(memberId: number, projectId: number, allocation: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/allocation`, {
      memberId,
      projectId,
      allocation
    });
  }
  

}
