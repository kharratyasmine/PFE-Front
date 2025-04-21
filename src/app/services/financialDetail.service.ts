import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { FinancialDetail } from '../model/FinancialDetail.model';

@Injectable({ providedIn: 'root' })
export class FinancialDetailService {
  private apiUrl = 'http://localhost:8080/financialDetails';

  constructor(private http: HttpClient) {}

  getFinancialDetailsByDevisId(devisId: number): Observable<FinancialDetail[]> {
    // Supposez que le backend expose un endpoint pour récupérer les détails par devis
    return this.http.get<FinancialDetail[]>(`${this.apiUrl}/devis/${devisId}`);
  }

  update(detail: FinancialDetail): Observable<FinancialDetail> {
    return this.http.put<FinancialDetail>(`${this.apiUrl}/${detail.id}`, detail);
  }

  getByDevisId(devisId: number): Observable<FinancialDetail[]> {
    return this.http.get<FinancialDetail[]>(`${this.apiUrl}/devis/${devisId}`);
  }
}
