import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DevisService } from '../../services/devis.service';
import { Devis } from 'src/app/model/devis.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-devis-details',
  templateUrl: './devis-details.component.html',
  styleUrls: ['./devis-details.component.css']
})
export class DevisDetailsComponent implements OnInit {
  @Input() selectedDevisForDetails!: Devis;
  devis?: Devis;
  devisList: Devis[] = [];
  @Input() devisId!: number; 
  distribution = {
    client: { partial: false, complete: false },
    user: { partial: false, complete: true }
  };

  customerFunctions: { [name: string]: string } = {};
  customerPartial: { [name: string]: boolean } = {};
  customerComplete: { [name: string]: boolean } = {};
  
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private devisService: DevisService,
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    const idFromUrl = Number(this.route.snapshot.paramMap.get('devisId'));
    const id = this.devisId || idFromUrl;
  
    if (id) {
      this.loadDevisDetails(id);
    } else {
      console.error("Aucun ID de devis fourni.");
    }
  }
  
  loadDevisDetails(id: number): void {
    this.devisService.getDevisById(id).subscribe({
      next: data => {
        this.devis = data;
        console.log("Nom du client :", this.devis.project?.client?.salesManagers);
        console.log("Nom de l'utilisateur :", this.devis.project?.userName);
      },
      error: err => console.error('Erreur lors du chargement des détails du devis :', err)
    });
  }

  downloadWord(): void {
    if (this.devisId) {
      this.devisService.downloadDevisWord(this.devisId);
    }
  }
  
 
}


