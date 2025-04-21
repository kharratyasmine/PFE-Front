import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { ProjectTaskMember } from '../model/ProjectTask.model';
@Injectable({
  providedIn: 'root'
})
export class ProjectTaskMemberService {
  private apiUrl = 'http://localhost:8080/task-members';  // 🔥 Assure-toi que cette URL est correcte !

  constructor(private http: HttpClient) {}  // ✅ Injection du `HttpClient`

 // tTaskMembers(taskId: number): Observable<ProjectTaskMember[]> {
 // return this.http.get<ProjectTaskMember[]>(`${this.apiUrl}/${taskId}`);
// 

 // signMemberToTask(taskMember: ProjectTaskMember): Observable<ProjectTaskMember> {
 // return this.http.post<ProjectTaskMember>(this.apiUrl, taskMember);
// 

// emoveTaskMember(id: number): Observable<void> {
  // eturn this.http.delete<void>(`${this.apiUrl}/${id}`);
// 
}
