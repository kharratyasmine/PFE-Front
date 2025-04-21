import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { PlannedWorkload } from '../model/plannedWorkload.model';

@Injectable({ providedIn: 'root' })
export class PlannedWorkloadService {
  private baseUrl = 'http://localhost:8080/api/planning';

  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<PlannedWorkload[]> {
    return this.http.get<PlannedWorkload[]>(`${this.baseUrl}/project/${projectId}`);
  }

  create(data: PlannedWorkload): Observable<PlannedWorkload> {
    return this.http.post<PlannedWorkload>(this.baseUrl, data);
  }

  update(id: number, data: PlannedWorkload): Observable<PlannedWorkload> {
    return this.http.put<PlannedWorkload>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
