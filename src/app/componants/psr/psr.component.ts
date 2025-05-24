import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { Psr } from 'src/app/model/psr.model';
import { PsrService } from 'src/app/services/psr.service';
import { UserService } from 'src/app/services/user.service';
import { PsrDetailsComponent } from '../psr-details/psr-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-psr',
  templateUrl: './psr.component.html',
  styleUrls: ['./psr.component.css']
})
export class PsrComponent implements OnInit {

  psrs: Psr[] = [];
  psr: Psr = this.emptyPsr();
  users: string[] = [];
  projectId: number | null = null;
  isEditMode = false;
  filterWeek: string = '';
  filteredPsrs: Psr[] = [];
  currentWeek: string = '';

  constructor(
    private psrService: PsrService,
    private userService: UserService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = +id;
        this.loadPsrs();
        this.loadUsers();
        this.setCurrentWeek();
      } else {
        alert("ID du projet non trouvé dans l'URL.");
      }
    });
  }

  private setCurrentWeek(): void {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    this.currentWeek = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  private checkCurrentWeekPsr(): void {
    const currentWeekPsr = this.psrs.find(p => p.week === this.currentWeek);
    if (!currentWeekPsr) {
      this.createNewWeekPsr();
    }
  }

  private createNewWeekPsr(): void {
    const newPsr = this.emptyPsr();
    newPsr.week = this.currentWeek;
    newPsr.reportDate = new Date();
    newPsr.reportTitle = `PSR - Semaine ${this.currentWeek}`;
    newPsr.overallStatus = 'En cours';
    
    if (this.projectId) {
      newPsr.projectId = this.projectId;
      this.psrService.create(newPsr).subscribe(() => {
        this.loadPsrs();
      });
    }
  }

  loadPsrs(): void {
    if (this.projectId) {
      this.psrService.getByProject(this.projectId).subscribe(
        psrs => {
          this.psrs = psrs;
          this.filterPsrs();
          this.checkCurrentWeekPsr();
        }
      );
    }
  }

  filterPsrs(): void {
    if (this.filterWeek.trim() === '') {
      this.filteredPsrs = [...this.psrs];
    } else {
      this.filteredPsrs = this.psrs.filter(psr =>
        psr.week?.toLowerCase().includes(this.filterWeek.toLowerCase())
      );
    }
  }
getHistoricalData(week: string): Psr[] {
    return this.psrs.filter(psr => {
        // Vérification de sécurité pour TypeScript
        if (!psr.week) return false;
        return psr.week <= week;
    });
}

  getWeekData(week: string): Psr | undefined {
    return this.psrs.find(psr => psr.week === week);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users.map(u => u.firstname + ' ' + u.lastname);
    });
  }

  editFromTable(psr: Psr): void {
    this.psr = { ...psr };
    this.isEditMode = true;
    const modal = new bootstrap.Modal(document.getElementById('psrModal')!);
    modal.show();
  }

  savePsr(): void {
    this.psr.projectId = this.projectId!;
    if (!this.isEditMode) {
      this.psr.week = this.currentWeek;
    }
    
    const request = this.isEditMode && this.psr.id
      ? this.psrService.updatePsr(this.psr.id, this.psr)
      : this.psrService.create(this.psr);

    request.subscribe(() => {
      this.loadPsrs();
      const modal = bootstrap.Modal.getInstance(document.getElementById('psrModal')!)!;
      modal.hide();
    });
  }

  deletePsr(id: number): void {
    if (confirm("Supprimer ce PSR ?")) {
      this.psrService.delete(id).subscribe(() => this.loadPsrs());
    }
  }

  private emptyPsr(): Psr {
    return {
      id: 0,
      reportTitle: '',
      reportDate: new Date(),
      comments: '',
      overallStatus: '',
      projectId: 0,
      devisId: 0,
      authorName: '',
      week: '',
      reference: '',
      edition: '',
      date: new Date(),
      preparedBy: '',
      approvedBy: '',
      validatedBy: '',
      preparedByDate: new Date(),
      approvedByDate: new Date(),
      validatedByDate: new Date(),
      status: '',
      projectName: '',
      clientName: '',
      risks: [],
      deliveries: []
    };
  }

  downloadPsr(id: number): void {
    this.psrService.downloadPsr(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
         a.download = `psr-${id}.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du PSR', err);
        alert('Erreur lors du téléchargement.');
      }
    });
  }

  openPsrDetailsModal(psrId: number) {
    const modalRef = this.modalService.open(PsrDetailsComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.psrId = psrId;
  }

}
