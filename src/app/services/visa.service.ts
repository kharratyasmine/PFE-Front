import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Visa } from "../model/distribution.model";

@Injectable({
    providedIn: 'root'
  })
  export class VisaService {
    private baseUrl = 'http://localhost:8080/visa';
  
    constructor(private http: HttpClient) {}
  
    getVisasByDevisId(devisId: number): Observable<Visa[]> {
      return this.http.get<Visa[]>(`${this.baseUrl}/devis/${devisId}`);
    }
  
    addVisa(devisId: number, visa: Visa): Observable<Visa> {
      return this.http.post<Visa>(`${this.baseUrl}/devis/${devisId}`, visa);
    }
  
    updateVisa(id: number, visa: Visa): Observable<Visa> {
      return this.http.put<Visa>(`${this.baseUrl}/${id}`, visa);
    }
  
    deleteVisa(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
  }