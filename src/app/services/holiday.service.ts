import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Holiday {
  name: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class HolidayService {
  constructor(private http: HttpClient) {}

  getPublicHolidays(year: number): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`/api/holidays/${year}`);
  }
  addSimpleHoliday(memberId: number, date: string) {
  return this.http.post(`/api/holidays/simple`, { memberId, date });
}
checkHolidayForMember(memberId: number, date: string) {
  return this.http.get<boolean>(`/api/holidays/check?memberId=${memberId}&date=${date}`);
}
deleteHolidayRobust(memberId: number, date: string) {
  return this.http.delete(`/api/holidays/delete?memberId=${memberId}&date=${date}`);
}

}
