import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { History } from '../model/history.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private apiUrl = 'http://localhost:8080/history';

  constructor(private http: HttpClient) {}

  getByDevisId(devisId: number): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/devis/${devisId}`);
  }

  add(devisId: number, history: History): Observable<History> {
    return this.http.post<History>(`${this.apiUrl}/devis/${devisId}`, history);
  }

  update(id: number, history: History): Observable<History> {
    return this.http.put<History>(`${this.apiUrl}/${id}`, history);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
