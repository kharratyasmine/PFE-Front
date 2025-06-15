import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlannedWorkload } from 'src/app/model/plannedWorkload.model';
import { PlannedWorkloadService } from 'src/app/services/PlannedWorkloadService.service';
import { Holiday, HolidayService } from 'src/app/services/holiday.service';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { ProjectSelectionService } from '../../../services/DashboardSelection.service';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/model/project.model';
import { Devis } from '../../../model/devis.model';
import { WorkloadDetail } from '../../../model/WorkloadDetail.model';
import { WorkloadDetailService } from 'src/app/services/WorkloadDetails.service';

@Component({
  selector: 'app-planned-workload',
  templateUrl: './planned-workload.component.html',
  styleUrls: ['./planned-workload.component.css']
})
export class PlannedWorkloadComponent implements OnInit, OnDestroy {
  projectId: number | null = null;
  workloads: PlannedWorkload[] = [];
  private subscription = new Subscription();
  selectedDevis: Devis | null = null;
  
  months: string[] = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  selectedDate: Date | null = null;
  holidays: { [key: string]: boolean } = {
    '2025-01-01': true,
    '2025-05-01': true,
    '2025-05-08': true,
    '2025-07-14': true,
    '2025-08-15': true,
    '2025-11-01': true,
    '2025-11-11': true,
    '2025-12-25': true,
  };

  dateClass = (date: Date): MatCalendarCellCssClasses => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return this.holidays[dateStr] ? 'holiday' : '';
  };

  holidaysInMonth: string[] = [];
  holidayList: Holiday[] = [];
  calendarVisible = false;
  selectedProject: Project | null = null;

  constructor(
    private service: PlannedWorkloadService,
    private holidayService: HolidayService,
    private projectSelectionService: ProjectSelectionService,
    private workloadDetailService: WorkloadDetailService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.projectSelectionService.selectedProject$.subscribe((project: Project | null) => {
        this.selectedProject = project;
        if (project && project.id !== undefined) {
          this.projectId = project.id;
          this.loadData();
        } else {
          this.projectId = null;
          this.workloads = [];
        }
      })
    );

    this.subscription.add(
      this.projectSelectionService.selectedDevis$.subscribe((devis: Devis | null) => {
        this.selectedDevis = devis;
        if (this.projectId) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadData(): void {
    if (this.selectedDevis && this.selectedDevis.id) {
      this.workloadDetailService.getByDevisId(this.selectedDevis.id).subscribe(details => {
        this.workloads = this.extractWorkloadsFromDevis(details);
      });
    } else {
      this.workloads = [];
    }
  }

  private extractWorkloadsFromDevis(workloadDetails: WorkloadDetail[]): PlannedWorkload[] {
    const currentYear = new Date().getFullYear();
    const extractedWorkloads: PlannedWorkload[] = [];

    // Créer un map pour stocker les workloads par mois
    const workloadMap = new Map<string, PlannedWorkload>();

    // Initialiser tous les mois avec des valeurs par défaut
    this.months.forEach(month => {
      workloadMap.set(month, {
        id: undefined,
        month: month,
        year: currentYear,
        estimatedWorkloadPerResource: 0,
        numberOfResources: 0,
        totalEstimatedWorkload: 0,
        projectId: this.projectId ?? 0,
        projectName: this.selectedProject?.name
      });
    });

    // Traiter chaque détail de workload du devis
    workloadDetails.forEach(detail => {
      const [month, year] = this.parsePeriod(detail.period);
      if (month && month !== 'Unknown') {
        const existingWorkload = workloadMap.get(month);
        if (existingWorkload) {
          existingWorkload.estimatedWorkloadPerResource = detail.estimatedWorkload;
          existingWorkload.numberOfResources = detail.numberOfResources;
          existingWorkload.totalEstimatedWorkload = detail.totalEstimatedWorkload;
          workloadMap.set(month, existingWorkload);
        }
      }
    });

    // Convertir le map en array
    workloadMap.forEach(workload => {
      extractedWorkloads.push(workload);
    });

    return extractedWorkloads;
  }

  private parsePeriod(period: string): [string, number | null] {
    const cleanedPeriod = period.trim().toLowerCase();
    const parts = cleanedPeriod.split(' ');

    // Définir le mapping des mois en dehors du bloc if
    const monthMapping: { [key: string]: string } = {
      'january': 'January',
      'february': 'February',
      'march': 'March',
      'april': 'April',
      'may': 'May',
      'june': 'June',
      'july': 'July',
      'august': 'August',
      'september': 'September',
      'october': 'October',
      'november': 'November',
      'december': 'December',
      'jan': 'January',
      'feb': 'February',
      'mar': 'March',
      'apr': 'April',
      'jun': 'June',
      'jul': 'July',
      'aug': 'August',
      'sep': 'September',
      'sept': 'September',
      'oct': 'October',
      'nov': 'November',
      'dec': 'December'
    };

    if (parts.length === 2) {
      let month = parts[0].toLowerCase();
      const year = parseInt(parts[1]);
      const mappedMonth = monthMapping[month] || 'Unknown';
      return [mappedMonth, isNaN(year) ? null : year];
    }

    // Si le format n'est pas reconnu, essayer de trouver le mois dans la chaîne
    for (const [key, value] of Object.entries(monthMapping) as [string, string][]) {
      if (cleanedPeriod.includes(key)) {
        return [value, null];
      }
    }

    // Valeur par défaut
    const currentMonth = this.months[new Date().getMonth()];
    return [currentMonth, null];
  }

  getByQuarter(q: number): PlannedWorkload[] {
    const quarters: { [key: number]: string[] } = {
      1: ['January', 'February', 'March'],
      2: ['April', 'May', 'June'],
      3: ['July', 'August', 'September'],
      4: ['October', 'November', 'December'],
    };

    const months = quarters[q];
    const currentYear = new Date().getFullYear();
    return months.map(month => {
      const existingWorkload = this.workloads.find(w => w.month === month);
      return existingWorkload || {
        id: undefined,
        month: month,
        year: currentYear,
        estimatedWorkloadPerResource: 0,
        numberOfResources: 0,
        totalEstimatedWorkload: 0,
        projectId: this.projectId ?? 0,
      };
    });
  }

  totalQuarter(q: number): number {
    return this.getByQuarter(q).reduce((sum, w) => sum + w.totalEstimatedWorkload, 0);
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

  getExportData(): { [key: string]: any }[] {
  return this.workloads.map(entry => ({
    Month: `${entry.month}/${entry.year}`,
    EstimatedWorkloadPerResource: entry.estimatedWorkloadPerResource,
    NumberOfResources: entry.numberOfResources,
    TotalEstimatedWorkload: entry.totalEstimatedWorkload
  }));
}

}