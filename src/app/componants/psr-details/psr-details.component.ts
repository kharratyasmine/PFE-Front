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
 @Input() selectedPsrForDetails!: Psr
  psr?: Psr;
  psrList: Psr[] = [];
  @Input() psrId!: number; 
  activeTab = 'teamOrganization';
 
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
       console.error("Aucun ID de psr fourni.");
     }
  }

  loadPsrDetails(id: number): void {
    this.psrService.getById(id).subscribe(
      (data) => { 
        this.psr = data;
        console.log("🔁 Détails du PSR récupérés : ", data);
      },
      (error) => console.error('❌ Erreur chargement PSR', error)
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  downloadPsr(): void {
    if (this.psr?.id) {
      this.psrService.downloadPsr(this.psr.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `psr-${this.psr?.id}.docx`; 
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
  }
}
