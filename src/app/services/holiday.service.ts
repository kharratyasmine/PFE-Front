import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Holiday {
  name: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private apiUrl = `localhost:8080/holidays`;

  constructor(private http: HttpClient) {}

  getPublicHolidays(year: number): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`/api/holidays/${year}`);
  }

  addSimpleHoliday(memberId: number, date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/simple`, { memberId, date });
  }

  addPartialHoliday(memberId: number, date: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/partial`, { memberId, date, type });
  }

  checkHolidayForMember(memberId: number, date: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${memberId}/${date}`);
  }

  deleteHolidayRobust(memberId: number, date: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${memberId}/${date}`);
  }

  getMemberHolidays(memberId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/member/${memberId}`);
  }
}
