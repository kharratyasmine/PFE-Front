import { Injectable } from '@angular/core';
import { TeamOrganization } from '../model/TeamOrganization.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamOrganizationService {
  private apiUrl = 'http://localhost:8080';
  
  constructor(private http: HttpClient) {}

  getTeamOrganization(psrId: number): Observable<TeamOrganization[]> {
    return this.http.get<TeamOrganization[]>(`${this.apiUrl}/teamOrganization/psr/${psrId}`);
  }

  getMembersFromProject(psrId: number): Observable<TeamOrganization[]> {
    return this.http.get<TeamOrganization[]>(`${this.apiUrl}/psr/${psrId}/project-members`);
  }

  getTeamOrganizationByWeek(psrId: number, week: string): Observable<TeamOrganization[]> {
    return this.http.get<TeamOrganization[]>(`${this.apiUrl}/teamOrganization/psr/${psrId}/week/${week}`);
  }
}