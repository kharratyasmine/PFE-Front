import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Distribution } from '../model/distribution.model';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {


  private baseUrl = 'http://localhost:8080/distribution';
  constructor(private http: HttpClient) { }

  getDistributionsByDevisId(devisId: number): Observable<Distribution[]> {
    return this.http.get<Distribution[]>(`http://localhost:8080/distribution/devis/${devisId}`);
  }

  // Appeler l'API pour récupérer les informations du projet complet
  getProjectDetails(devisId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/projects/${devisId}`);
  }

  updateDistribution(id: number, data: Distribution): Observable<Distribution> {
    return this.http.put<Distribution>(`${this.baseUrl}/${id}`, data);

  }
  
  
  addDistribution(devisId: number, distribution: Distribution): Observable<Distribution> {
    return this.http.post<Distribution>(`${this.baseUrl}/devis/${devisId}`, distribution);
  }
  
  
}
