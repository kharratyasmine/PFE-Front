import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../model/project.model';
import { Devis } from '../model/devis.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectSelectionService {
  private selectedProjectSubject = new BehaviorSubject<Project | null>(null);
  private selectedDevisSubject = new BehaviorSubject<Devis | null>(null);
  private selectedYearSubject = new BehaviorSubject<number | null>(null);

  selectedProject$ = this.selectedProjectSubject.asObservable();
  selectedDevis$ = this.selectedDevisSubject.asObservable();
  selectedYear$ = this.selectedYearSubject.asObservable();

  constructor() {
    // Restaurer l'état initial depuis le localStorage
    const savedProject = localStorage.getItem('selectedProject');
    const savedDevis = localStorage.getItem('selectedDevis');
    const savedYear = localStorage.getItem('selectedYear');

    if (savedProject) {
      this.selectedProjectSubject.next(JSON.parse(savedProject));
    }
    if (savedDevis) {
      this.selectedDevisSubject.next(JSON.parse(savedDevis));
    }
    if (savedYear) {
      this.selectedYearSubject.next(JSON.parse(savedYear));
    }
  }

  setSelectedProject(project: Project | null) {
    this.selectedProjectSubject.next(project);
    if (project) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }

  setSelectedDevis(devis: Devis | null) {
    this.selectedDevisSubject.next(devis);
    if (devis) {
      localStorage.setItem('selectedDevis', JSON.stringify(devis));
    } else {
      localStorage.removeItem('selectedDevis');
    }
  }

  setSelectedYear(year: number | null) {
    this.selectedYearSubject.next(year);
    if (year !== null) {
      localStorage.setItem('selectedYear', JSON.stringify(year));
    } else {
      localStorage.removeItem('selectedYear');
    }
  }

  getSelectedProject(): Project | null {
    return this.selectedProjectSubject.value;
  }

  getSelectedDevis(): Devis | null {
    return this.selectedDevisSubject.value;
  }

  getSelectedYear(): number | null {
    return this.selectedYearSubject.value;
  }

private selectedMonthSubject = new BehaviorSubject<Date | null>(null);
selectedMonth$ = this.selectedMonthSubject.asObservable();

setSelectedMonth(date: Date) {
  this.selectedMonthSubject.next(date);
}


} 