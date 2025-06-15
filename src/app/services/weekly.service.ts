import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WeeklyReport } from '../model/weekly.model';


@Injectable({ providedIn: 'root' })
export class WeeklyReportService {

  private apiUrl = 'http://localhost:8080/api/weekly-reports';

  constructor(private http: HttpClient) {}

  getByMonth(month: string, year: number): Observable<WeeklyReport[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<WeeklyReport[]>(this.apiUrl, { params });
  }

  generate(psrId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/generate/${psrId}`, {});
  }

getReportsByMonthAndPsr(month: string, year: number, psrId: number): Observable<WeeklyReport[]> {
    const params = new HttpParams()
        .set('month', month)
        .set('year', year.toString())
        .set('psrId', psrId.toString());
    return this.http.get<WeeklyReport[]>(this.apiUrl, { params });
}


}