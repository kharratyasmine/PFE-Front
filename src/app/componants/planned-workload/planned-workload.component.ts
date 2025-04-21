import { Component, OnInit } from '@angular/core';
import { PlannedWorkload } from 'src/app/model/plannedWorkload.model';
import { PlannedWorkloadService } from 'src/app/services/PlannedWorkloadService.service';
import { ActivatedRoute } from '@angular/router';
import { Holiday, HolidayService } from 'src/app/services/holiday.service';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';

@Component({
  selector: 'app-planned-workload',
  templateUrl: './planned-workload.component.html',
  styleUrls: ['./planned-workload.component.css'] // Si vous avez un fichier de style
})
export class PlannedWorkloadComponent implements OnInit {
  projectId: number | null = null;
  workloads: PlannedWorkload[] = [];
  currentWorkload: PlannedWorkload = this.emptyWorkload();
  editing = false;
  showModal = false;
  
  months: string[] = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  // Date sélectionnée pour le Datepicker Material
  selectedDate: Date | null = null;

  // Liste de jours fériés (exemple pour 2025, à adapter)
  holidays: { [key: string]: boolean } = {
    '2025-01-01': true, // Nouvel An
    '2025-05-01': true, // Fête du travail
    '2025-05-08': true, // Victoire 1945
    '2025-07-14': true, // Fête Nationale
    '2025-08-15': true, // Assomption
    '2025-11-01': true, // Toussaint
    '2025-11-11': true, // Armistice
    '2025-12-25': true, // Noël
    // Ajoutez d'autres dates si nécessaire
  };

  /**
   * Méthode appelée par Angular Material pour colorer certains jours.
   * Retourne la classe 'holiday' si le jour est férié.
   */
  dateClass = (date: Date): MatCalendarCellCssClasses => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // mois de 1 à 12
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return this.holidays[dateStr] ? 'holiday' : '';
  };

  holidaysInMonth: string[] = [];
  holidayList: Holiday[] = [];
  calendarVisible = false;

  constructor(
    private service: PlannedWorkloadService,
    private route: ActivatedRoute,
    private holidayService: HolidayService
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;
      if (this.projectId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.service.getByProject(this.projectId!).subscribe(data => {
      this.workloads = data;
    });
  }

  openModal(workload?: PlannedWorkload): void {
    this.editing = !!workload;
    this.currentWorkload = workload ? { ...workload } : this.emptyWorkload();
    this.showModal = true;
    if (this.currentWorkload.month && this.currentWorkload.year) {
      this.updateWorkingDays();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.holidaysInMonth = [];
  }

  save(): void {
    const saveOp = this.editing && this.currentWorkload.id
      ? this.service.update(this.currentWorkload.id, this.currentWorkload)
      : this.service.create(this.currentWorkload);
    saveOp.subscribe(() => {
      this.loadData();
      this.closeModal();
    });
  }

  confirmDelete(id: number): void {
    if (confirm('Supprimer cet élément ?')) {
      this.service.delete(id).subscribe(() => this.loadData());
    }
  }

  getByQuarter(q: number): PlannedWorkload[] {
    const quarters: { [key: number]: string[] } = {
      1: ['January', 'February', 'March'],
      2: ['April', 'May', 'June'],
      3: ['July', 'August', 'September'],
      4: ['October', 'November', 'December'],
    };
    return this.workloads.filter(w => quarters[q].includes(w.month));
  }

  totalQuarter(q: number): number {
    return this.getByQuarter(q).reduce((sum, w) => sum + w.totalEstimatedWorkload, 0);
  }

  emptyWorkload(): PlannedWorkload {
    return {
      id: undefined,
      month: '',
      year: new Date().getFullYear(),
      estimatedWorkloadPerResource: 0,
      numberOfResources: 0,
      totalEstimatedWorkload: 0,
      projectId: this.projectId ?? 0,
    };
  }

  updateTotal(): void {
    if (!this.currentWorkload.totalEstimatedWorkload || this.currentWorkload.totalEstimatedWorkload === 0) {
      this.currentWorkload.totalEstimatedWorkload =
        this.currentWorkload.estimatedWorkloadPerResource * this.currentWorkload.numberOfResources;
    }
  }

  onMonthOrYearChange(): void {
    this.updateWorkingDays();
    this.updateTotal();
  }

  updateWorkingDays(): void {
    const { month, year } = this.currentWorkload;
    const monthIndex = this.months.indexOf(month);
    if (!month || !year || monthIndex < 0) return;
    
    this.holidayService.getPublicHolidays(year).subscribe((holidays) => {
      const holidayDates = holidays.map(h => h.date);
      const holidaysInMonth: string[] = [];
      let workingDays = 0;
      const date = new Date(year, monthIndex, 1);
      while (date.getMonth() === monthIndex) {
        const day = date.getDay(); // 0: Sunday, 6: Saturday
        const iso = date.toISOString().split('T')[0];
        const isHoliday = holidayDates.includes(iso);
        if (day !== 0 && day !== 6 && !isHoliday) {
          workingDays++;
        } else if (isHoliday) {
          holidaysInMonth.push(iso);
        }
        date.setDate(date.getDate() + 1);
      }
      this.currentWorkload.estimatedWorkloadPerResource = workingDays;
      this.holidaysInMonth = holidaysInMonth;
    });
  }

  listMonthDays(monthName: string, year: number): {
    dateStr: string;
    label: string;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
  }[] {
    const monthIndex = this.months.indexOf(monthName);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const list: any[] = [];
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, monthIndex, day);
      const iso = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const holiday = this.holidayList.find(h => h.date === iso);
      list.push({
        dateStr: iso,
        label: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        isWeekend,
        isHoliday: !!holiday,
        holidayName: holiday?.name
      });
    }
    return list;
  }

  getHolidayName(year: number, monthName: string, day: number | null): string | null {
    if (!day) return null;
    const monthIndex = this.months.indexOf(monthName);
    const date = new Date(year, monthIndex, day);
    const iso = date.toISOString().split('T')[0];
    const holiday = this.holidayList.find(h => h.date === iso);
    return holiday ? holiday.name : null;
  }
}
