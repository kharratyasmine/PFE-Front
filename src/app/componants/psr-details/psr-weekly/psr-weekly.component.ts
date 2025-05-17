import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Psr } from 'src/app/model/psr.model';
import { EffortVariance, MonthlyEffort, WeeklyReport } from 'src/app/model/weekly.model';
import { PsrService } from 'src/app/services/psr.service';

@Component({
  selector: 'app-psr-weekly',
  templateUrl: './psr-weekly.component.html',
  styleUrls: ['./psr-weekly.component.css']
})
export class PsrWeeklyComponent implements OnInit {
  @Input() psrId!: number | undefined;
  @Input() psr!: Psr;
  weeklyReports: WeeklyReport[] = [
    { projectName: 'SEPAFAST (W1)', workingDays: 6, estimatedDays: 10, effortVariance: 0.3 },
    { projectName: 'SEPAFAST (W2)', workingDays: 7, estimatedDays: 12, effortVariance: 0.4 },
    { projectName: 'SEPAFAST (W3)', workingDays: 5, estimatedDays: 9, effortVariance: 0.2 }
  ];

  effortVariance: EffortVariance[] = [
    { week: 'W1', variance: -6.2 },
    { week: 'W2', variance: -5.0 },
    { week: 'W3', variance: 1.0 }
  ];

  monthlyEffort: MonthlyEffort[] = [
    { month: 'January', variance: -5.0 },
    { month: 'February', variance: 4.0 }
  ];

  actions = [
    { 
      date: new Date('2023-03-01'), 
      type: 'Risk', 
      risk: 'High', 
      who: 'Team', 
      what: 'Complete documentation', 
      when: new Date('2023-03-15'), 
      status: 'In Progress', 
      owner: 'John Doe', 
      priority: 'High', 
      comments: 'Need to finalize by end of month' 
    },
    { 
      date: new Date('2023-03-05'), 
      type: 'Issue', 
      risk: 'Medium', 
      who: 'Dev', 
      what: 'Fix API integration', 
      when: new Date('2023-03-10'), 
      status: 'Open', 
      owner: 'Jane Smith', 
      priority: 'Medium', 
      comments: 'Blocking feature development' 
    }
  ];

  constructor(
    private psrService: PsrService,
    //private teamOrganizationService: TeamOrganizationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifie si l'ID est fourni par le parent
    if (this.psrId) {
     // this.loadTeamOrganization(this.psrId);
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.psrId = id;
     //   this.loadTeamOrganization(id);
      }
    }
  }

  getTotalWorkingDays(): number {
    return this.weeklyReports.reduce((sum, report) => sum + report.workingDays, 0);
  }

  getTotalEstimatedDays(): number {
    return this.weeklyReports.reduce((sum, report) => sum + report.estimatedDays, 0);
  }

  getTotalVariancePercentage(): number {
    const totalEstimated = this.getTotalEstimatedDays();
    const totalWorking = this.getTotalWorkingDays();
    
    if (totalEstimated === 0) return 0;
    
    // Calculate variance percentage
    const variance = (totalWorking - totalEstimated) / totalEstimated;
    return variance * 100;
  }
}