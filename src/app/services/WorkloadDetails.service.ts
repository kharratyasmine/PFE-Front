import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkloadDetail } from '../model/WorkloadDetail.model';

@Injectable({
  providedIn: 'root'
})
export class WorkloadDetailService {
  private apiUrl = 'http://localhost:8080/workloadDetails';

  constructor(private http: HttpClient) {}

  // 🔹 Get all workload details by devis ID
  getByDevisId(devisId: number): Observable<WorkloadDetail[]> {
    return this.http.get<WorkloadDetail[]>(`${this.apiUrl}/devis/${devisId}`);
  }

  // 🔹 Create a workload detail
  create(workload: WorkloadDetail): Observable<WorkloadDetail> {
    return this.http.post<WorkloadDetail>(this.apiUrl, workload);
  }

  // 🔹 Update a workload detail
  update(id: number, workload: WorkloadDetail): Observable<WorkloadDetail> {
    return this.http.put<WorkloadDetail>(`${this.apiUrl}/${id}`, workload);
  }

  // 🔹 Delete a workload detail
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateWorkloadDetail(id: number, detail: WorkloadDetail): Observable<WorkloadDetail> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<WorkloadDetail>(`${this.apiUrl}/${id}`, detail, { headers });
  }
  getTotalWorkloadByDevisId(devisId: number) {
    return this.http.get<number>(`/workload-details/devis/${devisId}/total`);
  }
  
}
