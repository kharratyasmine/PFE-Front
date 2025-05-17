import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Risk } from '../model/risk.model';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  private baseUrl = 'http://localhost:8080/psr'; // 🔵 à adapter selon ton backend

  constructor(private http: HttpClient) { }

  addRisk(psrId: number, risk: Risk): Observable<Risk> {
    return this.http.post<Risk>(`${this.baseUrl}/${psrId}/risks`, risk);
  }

  getRisksByPsr(psrId: number): Observable<Risk[]> {
    return this.http.get<Risk[]>(`${this.baseUrl}/${psrId}/risks`);
  }

  deleteRisk(psrId: number, riskId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${psrId}/risks/${riskId}`);
  }
}
