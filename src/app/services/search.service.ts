// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchSubject = new Subject<string>();
  search$ = this.searchSubject.asObservable();

  emitSearch(term: string) {
    this.searchSubject.next(term);
  }
}
