import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoicingDetail } from '../model/InvoicingDetail.model';


@Injectable({
  providedIn: 'root'
})

export class InvoicingDetailService {
    private apiUrl = 'http://localhost:8080/invoicingDetails';

    constructor(private http: HttpClient) {}
    
      geInvoicingDetailsByDevisId(devisId: number): Observable<InvoicingDetail[]> {
        
        return this.http.get<InvoicingDetail[]>(`${this.apiUrl}/devis/${devisId}`);
      }
    
      update(detail: InvoicingDetail): Observable<InvoicingDetail> {
        return this.http.put<InvoicingDetail>(`${this.apiUrl}/${detail.id}`, detail);
      }
    
      getByDevisId(devisId: number): Observable<InvoicingDetail[]> {
        return this.http.get<InvoicingDetail[]>(`${this.apiUrl}/devis/${devisId}`);
      }

      generateInvoicing(devisId: number, startMonth: number): Observable<InvoicingDetail[]> {
        return this.http.post<InvoicingDetail[]>(
          `${this.apiUrl}/generate/${devisId}/${startMonth}`, {}
        );
      }
    
}