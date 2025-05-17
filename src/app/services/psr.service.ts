import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Psr } from '../model/psr.model';

@Injectable({
  providedIn: 'root'
})
export class PsrService {

  private baseUrl = 'http://localhost:8080/psr'; 

  constructor(private http: HttpClient) { }

  getAll(): Observable<Psr[]> {
    return this.http.get<Psr[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<Psr> {
    return this.http.get<Psr>(`${this.baseUrl}/${id}`);
  }

  create(psr: Psr): Observable<Psr> {
    return this.http.post<Psr>(`${this.baseUrl}`, psr);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  getByProject(projectId: number): Observable<Psr[]> {
    return this.http.get<Psr[]>(`${this.baseUrl}/project/${projectId}`);
  }

  updatePsr(id: number, psr: Psr): Observable<Psr> {
    return this.http.put<Psr>(`${this.baseUrl}/${id}`, psr);
  }
  downloadPsr(id: number): Observable<Blob> {
    return this.http.get(`http://localhost:8080/psr/${id}/export`, {
      responseType: 'blob'
    });
  }
  
}
