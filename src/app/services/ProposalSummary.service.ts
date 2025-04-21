import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProposalSummary } from '../model/distribution.model';


@Injectable({
  providedIn: 'root'
})
export class ProposalSummaryService {
  private baseUrl = 'http://localhost:8080/proposalSummary' ;

  constructor(private http: HttpClient) {}

  getByDevisId(devisId: number): Observable<ProposalSummary> {
    return this.http.get<ProposalSummary>(`${this.baseUrl}/devis/${devisId}`);
  }
}
