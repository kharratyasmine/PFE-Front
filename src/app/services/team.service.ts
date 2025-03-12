import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import { Team } from '../model/Team.model';
import { TeamMember } from '../model/TeamMember.model';
@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:8080/teams'; // ✅ Assure-toi que cette URL est correcte

  constructor(private http: HttpClient) {}

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}`);
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }
  
  getAllMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>('http://localhost:8080/team-members');
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

}
