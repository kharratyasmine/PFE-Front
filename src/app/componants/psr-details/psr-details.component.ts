import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Psr } from 'src/app/model/psr.model';
import { PsrService } from 'src/app/services/psr.service';

@Component({
  selector: 'app-psr-details',
  templateUrl: './psr-details.component.html',
  styleUrls: ['./psr-details.component.css']
})
export class PsrDetailsComponent implements OnInit {
  @Input() selectedPsrForDetails!: Psr;
  psr?: Psr;
  psrList: Psr[] = [];
  @Input() psrId!: number;
  activeTab = 'teamOrganization';
  
  // Nouvelles propriétés
  isLoading = false;
  errorMessage = '';
  showError = false;
  filterCriteria = '';

  constructor(
    private route: ActivatedRoute,
    private psrService: PsrService,
    public activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    const idFromUrl = Number(this.route.snapshot.paramMap.get('psrId'));
    const id = this.psrId || idFromUrl;
    
    if (id) {
      this.loadPsrDetails(id);
    } else {
      this.handleError("Aucun ID de PSR fourni.");
    }
  }

  loadPsrDetails(id: number): void {
    this.isLoading = true;
    this.showError = false;
    
    this.psrService.getById(id).subscribe({
      next: (data) => { 
        this.psr = data;
        this.isLoading = false;
        console.log("🔁 Détails du PSR récupérés : ", data);
      },
      error: (error) => {
        this.handleError('Erreur lors du chargement du PSR');
        console.error('❌ Erreur chargement PSR', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  downloadPsr(): void {
    if (this.validatePsrData()) {
      this.isLoading = true;
      this.psrService.downloadPsr(this.psr!.id!).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `psr-${this.psr?.id}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError('Erreur lors du téléchargement du PSR');
          console.error('Erreur lors du téléchargement du PSR', err);
        }
      });
    }
  }

  // Nouvelles méthodes
  private handleError(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    this.isLoading = false;
  }

  validatePsrData(): boolean {
    if (!this.psr || !this.psr.id) {
      this.handleError("Données PSR invalides");
      return false;
    }
    return true;
  }

  filterData(criteria: string): void {
    this.filterCriteria = criteria;
    // Implémentez la logique de filtrage ici
  }

  closeError(): void {
    this.showError = false;
    this.errorMessage = '';
  }
}
