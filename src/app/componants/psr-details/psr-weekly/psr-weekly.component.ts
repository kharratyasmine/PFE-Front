import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Psr } from 'src/app/model/psr.model';
import { WeeklyReport } from 'src/app/model/weekly.model';
import { PsrService } from 'src/app/services/psr.service';
import { WeeklyService } from 'src/app/services/weekly.service';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-psr-weekly',
  templateUrl: './psr-weekly.component.html',
  styleUrls: ['./psr-weekly.component.css']
})
export class PsrWeeklyComponent implements OnInit {
  @Input() psrId!: number | undefined;
  @Input() psr!: Psr;
  weeklyReports: WeeklyReport[] = [];
  loading = false;
  error: string | null = null;
  isEditing = false;
  reportForm: FormGroup;
  currentReport: WeeklyReport | null = null;

  // Chart configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Variance d\'effort',
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.3)'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Variance: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Variance (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Semaine'
        }
      }
    }
  };

  constructor(
    private psrService: PsrService,
    private weeklyService: WeeklyService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      projectName: ['', Validators.required],
      week: ['', Validators.required],
      workingDays: [0, [Validators.required, Validators.min(0)]],
      estimatedDays: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.psrId) {
      this.loadData(this.psrId);
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.psrId = id;
        this.loadData(id);
      }
    }
  }

  private loadData(psrId: number): void {
    this.loading = true;
    this.error = null;

    this.weeklyService.getWeeklyReports(psrId).subscribe({
      next: (reports) => {
        this.weeklyReports = reports.map(report => ({
          ...report,
          effortVariance: this.calculateEffortVariance(report)
        }));
        this.updateChart();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des rapports hebdomadaires';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  private calculateEffortVariance(report: WeeklyReport): number {
    if (!report || report.estimatedDays === 0) return 0;
    return ((report.workingDays - report.estimatedDays) / report.estimatedDays) * 100;
  }

  private updateChart(): void {
    if (!this.weeklyReports) return;
    
    this.lineChartData.labels = this.weeklyReports.map(report => report.week || '');
    this.lineChartData.datasets[0].data = this.weeklyReports.map(report => 
      report.effortVariance ?? 0
    );
  }

  getTotalWorkingDays(): number {
    if (!this.weeklyReports) return 0;
    return this.weeklyReports.reduce((sum, report) => sum + (report.workingDays || 0), 0);
  }

  getTotalEstimatedDays(): number {
    if (!this.weeklyReports) return 0;
    return this.weeklyReports.reduce((sum, report) => sum + (report.estimatedDays || 0), 0);
  }

  getTotalVariancePercentage(): number {
    const totalEstimated = this.getTotalEstimatedDays();
    const totalWorking = this.getTotalWorkingDays();
    
    if (totalEstimated === 0) return 0;
    
    const variance = (totalWorking - totalEstimated) / totalEstimated;
    return variance * 100;
  }

  openAddReportModal(): void {
    this.isEditing = false;
    this.currentReport = null;
    this.reportForm.reset();
    const modal = document.getElementById('reportModal');
    if (modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  openEditReportModal(report: WeeklyReport): void {
    if (!report) return;
    
    this.isEditing = true;
    this.currentReport = report;
    this.reportForm.patchValue({
      projectName: report.projectName || '',
      week: report.week || '',
      workingDays: report.workingDays || 0,
      estimatedDays: report.estimatedDays || 0
    });
    const modal = document.getElementById('reportModal');
    if (modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  onSubmit(): void {
    if (this.reportForm.valid && this.psrId) {
      const formValue = this.reportForm.value;
      const report: WeeklyReport = {
        ...formValue,
        psrId: this.psrId,
        id: this.currentReport?.id,
        effortVariance: this.calculateEffortVariance(formValue)
      };

      if (this.isEditing && this.currentReport?.id) {
        this.updateWeeklyReport(report);
      } else {
        this.addWeeklyReport(report);
      }

      const modal = document.getElementById('reportModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      }
    }
  }

  addWeeklyReport(report: WeeklyReport): void {
    if (!this.psrId || !report) return;
    
    this.weeklyService.addWeeklyReport(this.psrId, report).subscribe({
      next: (newReport) => {
        if (newReport) {
          this.weeklyReports.push({
            ...newReport,
            effortVariance: this.calculateEffortVariance(newReport)
          });
          this.updateChart();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'ajout du rapport';
        console.error('Erreur:', err);
      }
    });
  }

  updateWeeklyReport(report: WeeklyReport): void {
    if (!this.psrId || !report || !report.id) return;

    this.weeklyService.updateWeeklyReport(this.psrId, report.id, report).subscribe({
      next: (updatedReport) => {
        if (updatedReport) {
          const index = this.weeklyReports.findIndex(r => r.id === report.id);
          if (index !== -1) {
            this.weeklyReports[index] = {
              ...updatedReport,
              effortVariance: this.calculateEffortVariance(updatedReport)
            };
            this.updateChart();
          }
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du rapport';
        console.error('Erreur:', err);
      }
    });
  }

  deleteWeeklyReport(reportId: number): void {
    if (!this.psrId || !reportId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      this.weeklyService.deleteWeeklyReport(this.psrId, reportId).subscribe({
        next: () => {
          this.weeklyReports = this.weeklyReports.filter(r => r.id !== reportId);
          this.updateChart();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du rapport';
          console.error('Erreur:', err);
        }
      });
    }
  }
}