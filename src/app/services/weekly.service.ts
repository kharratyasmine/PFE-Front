import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeeklyReport } from '../model/weekly.model';


@Injectable({
  providedIn: 'root'
})
export class WeeklyService {
  private baseUrl = 'http://localhost:8080/weekly-reports';


  constructor(private http: HttpClient) {}

  getWeeklyReports(psrId: number): Observable<WeeklyReport[]> {
    return this.http.get<WeeklyReport[]>(`${this.baseUrl}/psr/${psrId}/reports`);
  }
  addWeeklyReport(psrId: number, report: WeeklyReport): Observable<WeeklyReport> {
    return this.http.post<WeeklyReport>(`${this.baseUrl}/psr/${psrId}/reports`, report);
  }

  updateWeeklyReport(psrId: number, reportId: number, report: WeeklyReport): Observable<WeeklyReport> {
    return this.http.put<WeeklyReport>(`${this.baseUrl}/psr/${psrId}/reports/${reportId}`, report);
  }

  deleteWeeklyReport(psrId: number, reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/psr/${psrId}/reports/${reportId}`);
  }

  getGeneratedWeeklyReports(psrId: number): Observable<WeeklyReport[]> {
  return this.http.get<WeeklyReport[]>(`${this.baseUrl}/psr/${psrId}/generated`);
}

}
