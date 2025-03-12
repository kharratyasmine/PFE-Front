import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devis } from '../model/devis.model';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = 'http://localhost:8080/devis';

  constructor(private http: HttpClient) {}

  getAllDevis(): Observable<Devis[]> {
    return this.http.get<Devis[]>(this.apiUrl);
  }

  getDevisById(id: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.apiUrl}/${id}`);
  }

  createDevis(devis: Devis): Observable<Devis> {
    return this.http.post<Devis>(this.apiUrl, devis);
  }

  updateDevis(id: number, devis: Devis): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}`, devis);
  }

  deleteDevis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
