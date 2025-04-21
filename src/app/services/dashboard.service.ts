import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/dashboard'; // Change selon ton backend

  constructor(private http: HttpClient) {}

  getProjectCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/projects/count`);
  }

  getTeamMemberCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/teamMembers/count`);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`);
  }

  getTasksByProject(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks/projectCount`);
  }
}
