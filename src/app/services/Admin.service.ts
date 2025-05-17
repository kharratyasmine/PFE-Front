// admin.service.ts

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/pending-users`);
  }

  approveUser(userId: number): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/approve-user/${userId}`, {});
  }

  rejectUser(userId: number, reason: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/reject-user/${userId}`, { reason });
  }
}