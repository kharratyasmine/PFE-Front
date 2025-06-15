import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { PsrService } from 'src/app/services/psr.service';

@Component({
  selector: 'app-psr-history',
  templateUrl: './psr-history.component.html',
  styleUrls: ['./psr-history.component.css']
})
export class PsrHistoryComponent implements OnInit {

  projects: any[] = [];
  years: number[] = [];
  selectedProjectId!: number;
  selectedYear!: number;
  psrs: any[] = [];

  constructor(private psrService: PsrService, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.initYears();
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe(data => {
      this.projects = data;
      if (this.projects.length > 0) {
        this.selectedProjectId = this.projects[0].id;
        this.loadPsrs();
      }
    });
  }

  initYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
    this.selectedYear = currentYear;
  }

  loadPsrs() {
    if (this.selectedProjectId && this.selectedYear) {
      this.psrService.getByProjectAndYear(this.selectedProjectId, this.selectedYear)
        .subscribe(data => {
          this.psrs = data;
        });
    }
  }

  viewPsr(psrId: number) {
    // Ici tu peux router vers ta page "PSR Detail"
    // Par exemple :
    // this.router.navigate(['/psr-detail', psrId]);
    console.log("View PSR", psrId);
  }
}

