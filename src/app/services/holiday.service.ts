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
  
}
