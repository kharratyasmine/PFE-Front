import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember } from '../model/TeamMember.model';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private apiUrl = 'http://localhost:8080/teamMember'; // URL du backend

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les membres de l'équipe.
   * @returns Observable contenant la liste des membres.
   */
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}`);
  }

  /**
   * Récupère un membre spécifique par son ID.
   * @param id ID du membre.
   * @returns Observable contenant le membre.
   */
  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ajoute un nouveau membre d'équipe.
   * @param teamMember Données du membre.
   * @returns Observable contenant le membre ajouté.
   */
  addTeamMember(teamMember: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}`, teamMember);
  }

  /**
   * Met à jour un membre existant.
   * @param id ID du membre à mettre à jour.
   * @param teamMember Nouvelles données du membre.
   * @returns Observable contenant le membre mis à jour.
   */
  updateTeamMember(id: number, teamMember: TeamMember): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.apiUrl}/${id}`, teamMember);
  }

  /**
   * Supprime un membre d'équipe.
   * @param id ID du membre à supprimer.
   * @returns Observable de confirmation.
   */
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
}
