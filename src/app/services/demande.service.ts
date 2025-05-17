import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande } from 'src/app/model/demande.model'; // modèle Angular à définir


@Injectable({
  providedIn: 'root'
})
export class DemandeService {
 private apiUrl = 'http://localhost:8080/demandes';

  constructor(private http: HttpClient) {}

  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl);
  }

  getDemandesByClient(clientId: number): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getDemandesByProject(projectId: number): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createDemande(demande: Demande): Observable<Demande> {
    return this.http.post<Demande>(this.apiUrl, demande);
  }

  updateDemande(id: number, demande: Demande): Observable<Demande> {
    return this.http.put<Demande>(`${this.apiUrl}/${id}`, demande);
  }

  deleteDemande(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
