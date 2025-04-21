import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember } from '../model/TeamMember.model';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private apiUrl = 'http://localhost:8080/teamMembers'; // URL du backend

  constructor(private http: HttpClient) { }

  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`http://localhost:8080/${id}`);
  }

  getMembersByTeamId(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`http://localhost:8080/teamMembers/team/${teamId}/members`);
  }

  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.apiUrl);
  }

  getMembersByProject(projectId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`http://localhost:8080/projects/${projectId}/members`);
  }
  

  addTeamMember(teamMember: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}`, teamMember);
  }
  updateTeamMember(id: number, teamMember: TeamMember): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.apiUrl}/${id}`, teamMember);
  }
  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  downloadExcel(teamMember: TeamMember[]): Observable<Blob> {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(teamMember);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return new Observable((observer) => {
      observer.next(blob);
      observer.complete();
    });
  }
  // ✅ Récupérer les membres d'une équipe spécifique
  getMembersByTeam(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/members/${teamId}`);
  }
  // ✅ Ajouter un membre à une équipe
  addMemberToTeam(memberId: number, teamId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${memberId}/${teamId}`, {});
  }
  // ✅ Supprimer un membre d'une équipe
  removeMemberFromTeam(memberId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${memberId}/${teamId}`);
  }
  // Méthode pour récupérer les membres d'une équipe en fonction de teamId et projectId
  getTeamMembersByTeamAndProject(teamId: number, projectId: number): Observable<any> {
    const params = new HttpParams()
      .set('teamId', teamId.toString())
      .set('projectId', projectId.toString());

    return this.http.get(`${this.apiUrl}/by-team-project`, { params });
  }

  
}
