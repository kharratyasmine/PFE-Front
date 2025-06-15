import { Component, Input, OnInit } from "@angular/core";
import { WeeklyReport } from "src/app/model/weekly.model";
import { WeeklyReportService } from "src/app/services/weekly.service";
import { ChartData, ChartOptions } from 'chart.js';
import { PsrService } from "src/app/services/psr.service";
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-psr-weekly',
  templateUrl: './psr-weekly.component.html',
  styleUrls: ['./psr-weekly.component.css']
})
export class PsrWeeklyComponent implements OnInit {
  @Input() psrId!: number;
  Object = Object;

  reports: WeeklyReport[] = [];
  loading = false;
  error: string | null = null;

  currentDate: Date = new Date();
  selectedMonth: string = this.currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  selectedYear: number = this.currentDate.getFullYear();
  
  // Data for the tables
  monthlyWorkloadData: any[] = [];
  monthlyWorkloadTotals = { workingDays: 0, estimatedDays: 0, effortVariance: 0 };
  weeklyEffortVarianceData: any[] = [];
  monthlyConsolidatedEffortVarianceData: any[] = [];

  // Data for the charts
  weeklyWorkloadChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  weeklyEffortVarianceChartData: ChartData<'line'> = { labels: [], datasets: [] };
  monthlyConsolidatedEffortVarianceChartData: ChartData<'line'> = { labels: [], datasets: [] };


  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Effort Variance (%)'
        }
      }
    }
  };
  chartColors = [{ borderColor: '#3e95cd', backgroundColor: 'rgba(62,149,205,0.2)' }];

  weeks: number[] = [];
  groupedByProject: { [project: string]: { [week: number]: WeeklyReport | null } } = {};

  constructor(
    private reportService: WeeklyReportService,
    private psrService: PsrService
  ) { }

ngOnInit(): void {
    this.loading = true;
    this.error = null;

    this.psrService.getById(this.psrId).subscribe({
        next: psr => {
            this.psr = psr;

            // Met à jour selectedMonth et selectedYear à partir du PSR !
            this.selectedMonth = this.getMonthFromReportDate(psr.reportDate);
            this.selectedYear = new Date(psr.reportDate).getFullYear();

            console.log("Selected month:", this.selectedMonth, "Selected year:", this.selectedYear);

            // Appelle l'API pour charger les WeeklyReports cohérents
            this.reportService.getReportsByMonthAndPsr(this.selectedMonth, this.selectedYear, this.psrId).subscribe({
                next: reports => {
                    this.reports = reports;

                    // ✅ Ici : on appelle directement processReports() → ne PAS appeler calculateWeeksOfMonth() !
                    this.processReports();

                    this.loading = false;
                },
                error: err => {
                    this.error = "Error loading weekly reports.";
                    this.loading = false;
                }
            });
        },
        error: err => {
            this.error = "Error loading PSR.";
            this.loading = false;
        }
    });
}




//  calculateWeeksOfMonth(): void {
//    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
//    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
//
//    const firstWeek = this.getWeekNumber(firstDay);
//    const lastWeek = this.getWeekNumber(lastDay);

  //  this.weeks = [];
  //  for (let w = firstWeek; w <= lastWeek; w++) {
  //    this.weeks.push(w);
  //  }
//  }

  getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  }

getMonthFromReportDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    return date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
}
psr!: any;

processReports(): void {
    // Générer les weeks pour le mois du PSR
    this.calculateWeeksOfMonthFromReportDate(this.psr.reportDate);

    // Ensuite → grouper les reports
    this.groupReports();

    // Puis les calculs habituels
    this.calculateMonthlyWorkloadData();
    this.calculateWeeklyEffortVarianceData();
    this.calculateMonthlyConsolidatedEffortVarianceData();
    this.updateCharts();
}



  groupReports(): void {
    this.groupedByProject = {};
    for (const report of this.reports) {
      if (!this.groupedByProject[report.projectName]) {
        this.groupedByProject[report.projectName] = {};
        // Initialize all weeks for the current month to null for each project
        for (const week of this.weeks) {
          this.groupedByProject[report.projectName][week] = null;
        }
      }
      // Assign the report to the correct week number
      if (this.weeks.includes(report.weekNumber)) {
         this.groupedByProject[report.projectName][report.weekNumber] = report;
      }
    }
  }

 calculateMonthlyWorkloadData(): void {
    this.monthlyWorkloadData = [];
    this.monthlyWorkloadTotals = { workingDays: 0, estimatedDays: 0, effortVariance: 0 };

    for (const week of this.weeks) { // Itérer sur chaque semaine
        let totalWorkingDaysWeek = 0;
        let totalEstimatedDaysWeek = 0;

        // Cumuler les données de tous les projets pour la semaine actuelle
        for (const project of Object.keys(this.groupedByProject)) {
            const report = this.groupedByProject[project][week];
            if (report) {
                totalWorkingDaysWeek += report.workingDays || 0;
                totalEstimatedDaysWeek += report.estimatedDays || 0;
            }
        }

        // Ajouter une ligne pour la semaine si des données existent
        if (totalWorkingDaysWeek > 0 || totalEstimatedDaysWeek > 0) {
            const effortVarianceWeek = totalEstimatedDaysWeek === 0 ? 0 : ((totalWorkingDaysWeek - totalEstimatedDaysWeek) / totalEstimatedDaysWeek) * 100;

            this.monthlyWorkloadData.push({
                month: this.selectedMonth,
                projectName: `${this.psr.projectName} (W${week})`,
                workingDays: totalWorkingDaysWeek,
                estimatedDays: totalEstimatedDaysWeek,
                effortVariance: effortVarianceWeek
            });

            // Cumuler les totaux mensuels à partir des totaux hebdomadaires
            this.monthlyWorkloadTotals.workingDays += totalWorkingDaysWeek;
            this.monthlyWorkloadTotals.estimatedDays += totalEstimatedDaysWeek;
        }
    }

    // Calcul du total effortVariance global
    this.monthlyWorkloadTotals.effortVariance = this.monthlyWorkloadTotals.estimatedDays === 0
        ? 0
        : ((this.monthlyWorkloadTotals.workingDays - this.monthlyWorkloadTotals.estimatedDays) / this.monthlyWorkloadTotals.estimatedDays) * 100;
}


  calculateWeeklyEffortVarianceData(): void {
    this.weeklyEffortVarianceData = [];
    for (const week of this.weeks) {
      let totalWorkedDays = 0;
      let totalEstimatedDays = 0;

      for (const project of Object.keys(this.groupedByProject)) {
        const report = this.groupedByProject[project][week];
        if (report) {
          totalWorkedDays += report.workingDays || 0;
          totalEstimatedDays += report.estimatedDays || 0;
        }
      }
      const effortVariance = totalEstimatedDays === 0 ? 0 : ((totalWorkedDays - totalEstimatedDays) / totalEstimatedDays) * 100;
      this.weeklyEffortVarianceData.push({ week: `W${week}`, effortVariance: effortVariance });
    }
  }
calculateWeeksOfMonthFromReportDate(reportDateStr: string): void {
    const reportDate = new Date(reportDateStr);

    // Le mois du PSR
    const targetMonth = reportDate.getMonth();
    const targetYear = reportDate.getFullYear();

    // 1er jour du mois du PSR
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    const firstWeek = this.getWeekNumber(firstDay);
    const lastWeek = this.getWeekNumber(lastDay);

    this.weeks = [];
    for (let w = firstWeek; w <= lastWeek; w++) {
        this.weeks.push(w);
    }

    console.log("Weeks pour le mois du PSR:", this.weeks);
}

  calculateMonthlyConsolidatedEffortVarianceData(): void {
      // This requires data from all months, not just the selected one.
      // For now, we'll calculate for the current month as a single data point.
      // A more complete implementation would fetch data for all relevant months.

      let totalWorkedDays = 0;
      let totalEstimatedDays = 0;

      for (const report of this.reports) {
          totalWorkedDays += report.workingDays || 0;
          totalEstimatedDays += report.estimatedDays || 0;
      }

      const effortVariance = totalEstimatedDays === 0 ? 0 : ((totalWorkedDays - totalEstimatedDays) / totalEstimatedDays) * 100;

      this.monthlyConsolidatedEffortVarianceData = [{
          month: this.selectedMonth,
          effortVariance: effortVariance
      }];
      // To fully match the capture, you'd need to fetch data for all months
      // and aggregate accordingly.
  }

  updateCharts(): void {
      // Update Weekly Workload By Project / Module Bar Chart
      const weeklyWorkloadLabels: string[] = [];
      const workedDaysData: number[] = [];
      const estimatedDaysData: number[] = [];

      for (const data of this.monthlyWorkloadData) {
          weeklyWorkloadLabels.push(data.projectName); // projectName contient déjà "ProjectName (WXX)"
          workedDaysData.push(data.workingDays || 0);
          estimatedDaysData.push(data.estimatedDays || 0);
      }

      this.weeklyWorkloadChartData = {
          labels: weeklyWorkloadLabels,
          datasets: [
              {
                  label: 'Working Days (MD)',
                  data: workedDaysData,
                  backgroundColor: 'red' // Example color
              },
              {
                  label: 'Estimated Days (MD)',
                  data: estimatedDaysData,
                  backgroundColor: 'green' // Example color
              }
          ]
      };

      // Update Weekly Effort Variance Line Chart
      this.weeklyEffortVarianceChartData = {
          labels: this.weeklyEffortVarianceData.map(data => data.week),
          datasets: [
              {
                  label: 'Weekly Effort Variance',
                  data: this.weeklyEffortVarianceData.map(data => data.effortVariance),
                  borderColor: 'blue', // Example color
                  fill: false
              }
          ]
      };

      // Update Monthly Consolidated Effort Variance Line Chart
      this.monthlyConsolidatedEffortVarianceChartData = {
          labels: this.monthlyConsolidatedEffortVarianceData.map(data => data.month),
          datasets: [
              {
                  label: 'Monthly Consolidated Effort Variance',
                  data: this.monthlyConsolidatedEffortVarianceData.map(data => data.effortVariance),
                  borderColor: 'purple', // Example color
                  fill: false
              }
          ]
      };

  }
}
