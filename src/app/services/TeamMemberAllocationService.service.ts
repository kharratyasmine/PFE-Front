// src/app/services/team-member-allocation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMemberAllocation } from '../model/MemberAllocation.model';


@Injectable({
  providedIn: 'root'
})
export class TeamMemberAllocationService {
 
  private apiUrl = 'http://localhost:8080/allocations';

  constructor(private http: HttpClient) {}

  getAllAllocations(): Observable<TeamMemberAllocation[]> {
    return this.http.get<TeamMemberAllocation[]>(this.apiUrl)
      
  }

  // Créer une allocation
  addAllocation(allocation: TeamMemberAllocation): Observable<TeamMemberAllocation> {
    return this.http.post<TeamMemberAllocation>(`${this.apiUrl}`, allocation);
  }

  // Mettre à jour une allocation
  updateAllocation(id: number, allocation: TeamMemberAllocation): Observable<TeamMemberAllocation> {
    return this.http.put<TeamMemberAllocation>(`${this.apiUrl}/${id}`, allocation);
  }
  // Supprimer une allocation
  deleteAllocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer une allocation par membre et projet
  getAllocationByMemberAndProject(memberId: number, projectId: number): Observable<TeamMemberAllocation> {
    // Adaptez l’URL en fonction de votre mapping Spring
    // par exemple : GET /team-member-allocations/search?memberId=X&projectId=Y
    return this.http.get<TeamMemberAllocation>(
      `${this.apiUrl}/search?memberId=${memberId}&projectId=${projectId}`
    );
  }
    // Ajoutez cette méthode pour récupérer toutes les allocations d'un projet
  getAllocationsByProject(projectId: number): Observable<TeamMemberAllocation[]>{
    return this.http.get<TeamMemberAllocation[]>(`${this.apiUrl}/project/${projectId}`);}
}
