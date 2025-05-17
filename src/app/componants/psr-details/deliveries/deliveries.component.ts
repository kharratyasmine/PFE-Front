import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Deliveries } from 'src/app/model/deliveries.model';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.css']
})
export class DeliveriesComponent implements OnInit {
  @Input() psrId!: number | undefined;
  deliveries: Deliveries[] = [];
  selectedDelivery?: Deliveries;
  isEditMode = false;
  modal?: Modal;

  constructor(
    private deliveriesService: DeliveriesService,
    private route: ActivatedRoute,
    public activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    // Récupérer le psrId soit à partir de l'input soit à partir de l'URL
    if (this.psrId) {
      console.log(`🔄 Initialisation avec psrId (input): ${this.psrId}`);
      this.loadDeliveries(this.psrId);
    } else {
      // Essayons d'abord de récupérer de l'URL actuelle
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.psrId = Number(idParam);
        console.log(`🔄 Initialisation avec psrId (route param 'id'): ${this.psrId}`);
        this.loadDeliveries(this.psrId);
      } else {
        // Essayons de récupérer 'psrId' comme paramètre
        const psrIdParam = this.route.snapshot.paramMap.get('psrId');
        if (psrIdParam) {
          this.psrId = Number(psrIdParam);
          console.log(`🔄 Initialisation avec psrId (route param 'psrId'): ${this.psrId}`);
          this.loadDeliveries(this.psrId);
        } else {
          console.error("❌ Impossible de récupérer le psrId");
        }
      }
    }

    // Initialiser le modal Bootstrap
    const modalElement = document.getElementById('deliveryModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  loadDeliveries(psrId: number): void {
    console.log(`📦 Chargement des livraisons pour le PSR ${psrId}`);
    this.deliveriesService.getDeliveriesByPsr(psrId).subscribe(
      data => {
        this.deliveries = data;
        console.log(`✅ ${data.length} livraisons chargées:`, data);
      },
      error => console.error("❌ Erreur de chargement des deliveries", error)
    );
  }

  openModal(delivery?: Deliveries): void {
    this.selectedDelivery = delivery ? { ...delivery } : {
      id: 0,
      deliveriesName: '',
      description: '',
      version: '',
      plannedDate: '',
      effectiveDate: '',
      status: 'Planned',
      customerFeedback: 'No Feedback',
      psrId: this.psrId ?? 0
    };
    this.isEditMode = !!delivery;
    console.log(`🔖 Ouverture du modal en mode ${this.isEditMode ? 'édition' : 'création'}`);
    
    // Afficher le modal Bootstrap
    if (this.modal) {
      this.modal.show();
    } else {
      console.error("❌ Le modal Bootstrap n'est pas initialisé");
    }
  }

  saveDelivery(): void {
    if (!this.selectedDelivery) {
      console.error("❌ Pas de livraison sélectionnée");
      return;
    }
    
    if (!this.psrId) {
      console.error("❌ Pas de PSR ID disponible");
      return;
    }

    console.log(`💾 Sauvegarde d'une livraison pour le PSR ${this.psrId}:`, this.selectedDelivery);

    if (this.isEditMode) {
      this.deliveriesService.deleteDelivery(this.psrId, this.selectedDelivery.id).subscribe(
        () => {
          console.log(`✅ Livraison ${this.selectedDelivery!.id} supprimée avec succès`);
          this.deliveriesService.addDelivery(this.psrId!, this.selectedDelivery!).subscribe(
            newDelivery => {
              console.log(`✅ Livraison mise à jour avec succès:`, newDelivery);
              this.loadDeliveries(this.psrId!);
              this.closeModal();
            },
            error => console.error("❌ Erreur lors de la mise à jour de la livraison", error)
          );
        },
        error => console.error("❌ Erreur lors de la suppression de la livraison avant mise à jour", error)
      );
    } else {
      // Assurons-nous que le psrId est bien défini dans l'objet livraison
      this.selectedDelivery.psrId = this.psrId;
      
      this.deliveriesService.addDelivery(this.psrId, this.selectedDelivery).subscribe(
        newDelivery => {
          console.log(`✅ Nouvelle livraison ajoutée avec succès:`, newDelivery);
          this.loadDeliveries(this.psrId!);
          this.closeModal();
        },
        error => console.error("❌ Erreur lors de l'ajout de la livraison", error)
      );
    }
  }

  deleteDelivery(id: number): void {
    if (!this.psrId) {
      console.error("❌ Pas de PSR ID disponible");
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      console.log(`🗑️ Suppression de la livraison ${id} du PSR ${this.psrId}`);
      
      this.deliveriesService.deleteDelivery(this.psrId, id).subscribe(
        () => {
          this.deliveries = this.deliveries.filter(d => d.id !== id);
          console.log(`✅ Livraison ${id} supprimée avec succès`);
        },
        error => console.error(`❌ Erreur lors de la suppression de la livraison ${id}`, error)
      );
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    } else {
      console.error("❌ Le modal Bootstrap n'est pas initialisé");
    }
  }
}
