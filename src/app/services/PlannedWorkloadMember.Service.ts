import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { PlannedWorkloadMember } from '../model/PlannedWorkloadMember.model';
import { Project } from '../model/project.model';

@Injectable({ providedIn: 'root' })
export class PlannedWorkloadMemberService {
  private baseUrl = 'http://localhost:8080/plannedWorkloadMember';

  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<PlannedWorkloadMember[]> {
    return this.http.get<PlannedWorkloadMember[]>(`${this.baseUrl}/project/${projectId}`);
  }

  create(data: PlannedWorkloadMember): Observable<PlannedWorkloadMember> {
    return this.http.post<PlannedWorkloadMember>(`${this.baseUrl}`, data);
  }

  update(id: number, data: PlannedWorkloadMember): Observable<PlannedWorkloadMember> {
    return this.http.put<PlannedWorkloadMember>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  getByMember(projectId: number, memberId: number): Observable<PlannedWorkloadMember[]> {
    return this.http.get<PlannedWorkloadMember[]>(
      `${this.baseUrl}/member/${projectId}/${memberId}`
    );
  }

  getAllProjects() {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }
  
  bulkSave(workloads: PlannedWorkloadMember[]) {
    return this.http.post(`${this.baseUrl}/bulk`, workloads);
  }
  
  getByProjectAndYear(projectId: number, year: number) {
    return this.http.get<PlannedWorkloadMember[]>(
      `${this.baseUrl}/project/${projectId}/year/${year}`
    );
  }
  
  generateWorkloads(projectId: number, year: number) {
    return this.http.post<PlannedWorkloadMember[]>(`${this.baseUrl}/generate/${projectId}`, {});
  }
  
  exportToExcel(projectId: number, year: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/project/${projectId}/year/${year}/export`, {
      responseType: 'blob'
    });
  }
}
