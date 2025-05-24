import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditLog } from '../model/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private baseUrl = 'http://localhost:8080/api/audit-logs'; // Adapter si besoin

  constructor(private http: HttpClient) {}

  getAllLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.baseUrl);
  }

  getLogsByProject(projectName: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}?project=${projectName}`);
  }

  getLogsByUser(username: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}?user=${username}`);
  }
}
