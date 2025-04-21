import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DistributionService } from 'src/app/services/distribution.service';
import { Distribution, ProposalSummary, Visa } from 'src/app/model/distribution.model';
import { Devis } from 'src/app/model/devis.model';
import { VisaService } from 'src/app/services/visa.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/model/user.model';
import { ProposalSummaryService } from 'src/app/services/ProposalSummary.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  @Input() devisId!: number | undefined;
  @Input() devis!: Devis;

  distributions: Distribution[] = [];
  isEditModalOpen = false;
  distributionToEdit: Distribution | null = null;
  visaErrorMessage: string | null = null;

  visas: Visa[] = [];
  users: User[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private distributionService: DistributionService,
    private visaService: VisaService,
    private modalService: NgbModal,
    private userService: UserService,
    private proposalSummaryService : ProposalSummaryService
  ) { }

  ngOnInit(): void {
    this.loadDistributions();
    this.loadVisas();
    this.loadUsers();
    this.loadProposalSummary();
  }

  loadDistributions(): void {
    const id = this.devisId || this.devis?.id;

    if (id) {
      this.distributionService.getDistributionsByDevisId(id).subscribe({
        next: data => {
          this.distributions = data; // ✅ plus besoin de recalculer 'from'
        },
        error: err => console.error("❌ Erreur lors du chargement des distributions :", err)
      });
    }
  }




  saveDistributions(): void {
    this.distributions.forEach(distribution => {
      if (distribution.id) {
        // Mise à jour
        this.distributionService.updateDistribution(distribution.id, distribution).subscribe({
          next: updated => {
            const index = this.distributions.findIndex(d => d.id === updated.id);
            if (index !== -1) this.distributions[index] = updated;
          },
          error: err => console.error('❌ Erreur mise à jour :', err)
        });
      } else {
        // Ajout
        this.distributionService.addDistribution(distribution.devisId, distribution).subscribe({
          next: added => this.distributions.push(added),
          error: err => console.error('❌ Erreur ajout :', err)
        });
      }
    });
  }

  openEditModal(distribution: Distribution): void {
    this.distributionToEdit = { ...distribution };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.distributionToEdit = null;
    this.isEditModalOpen = false;
  }

  saveEditedDistribution(): void {
    if (!this.distributionToEdit) return;

    const payload = {
      ...this.distributionToEdit,
      type: this.distributionToEdit.type || 'customer'
    };

    // 🔁 Update si ID existe
    if (payload.id) {
      this.distributionService.updateDistribution(payload.id, payload).subscribe({
        next: (updated) => {
          const index = this.distributions.findIndex(d => d.id === updated.id);
          if (index !== -1) this.distributions[index] = updated;
          this.closeEditModal();
          this.loadDistributions(); // recharge après modif
        },
        error: (err) => console.error("❌ Erreur mise à jour :", err)
      });
    }
    // ➕ Add sinon
    else {
      this.distributionService.addDistribution(payload.devisId, payload).subscribe({
        next: (added) => {
          this.distributions.push(added);
          this.closeEditModal();
          this.loadDistributions(); // recharge après ajout
        },
        error: (err) => console.error("❌ Erreur ajout :", err)
      });
    }
  }





  get customerDistributions(): Distribution[] {
    return this.distributions.filter(d => d.type === 'customer');
  }

  get telnetDistributions(): Distribution[] {
    return this.distributions.filter(d => d.type === 'telnet');
  }



  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error("Erreur chargement utilisateurs :", err)
    });
  }

  loadVisas(): void {
    const id = this.devisId || this.devis?.id;
    if (id) {
      this.visaService.getVisasByDevisId(id).subscribe({
        next: data => this.visas = data,
        error: err => console.error("Erreur chargement visas :", err)
      });
    }
  }

  currentVisa: Visa = { devisId: 0, action: 'Written by', name: '', date: '', visa: '' };
  isVisaModalOpen = false;

  openAddVisaModal(): void {
    this.currentVisa = {
      devisId: this.devisId!,
      action: 'Written by',
      name: '',
      date: new Date().toISOString().split('T')[0],
      visa: ''
    };
    this.isVisaModalOpen = true;
  }

  availableActions: string[] = ['Written by', 'Verified by', 'Approved by'];

isActionUsed(action: string): boolean {
  return this.visas.some(v => v.action === action && v.id !== this.currentVisa?.id);
}


  openEditVisaModal(visa: Visa): void {
    this.currentVisa = { ...visa };
    this.isVisaModalOpen = true;
  }

  closeVisaModal(): void {
    this.currentVisa = { devisId: this.devisId!, action: 'Written by', name: '', date: '', visa: '' };
    this.isVisaModalOpen = false;
  }

  saveEditedVisa(): void {
    if (!this.currentVisa) return;
  
    const isDuplicate = this.visas.some(
      v => v.action === this.currentVisa?.action && v.id !== this.currentVisa?.id
    );
  
    if (isDuplicate) {
      this.visaErrorMessage = "⚠️ Cette action a déjà été utilisée !";
      return; // on bloque la soumission
    }
  
    // S'il n'y a pas de duplication
    this.visaErrorMessage = null;
  
    // Ensuite continue avec l’appel au service (PUT ou POST)
    if (this.currentVisa.id) {
      this.visaService.updateVisa(this.currentVisa.id, this.currentVisa).subscribe({
        next: (updated) => {
          const index = this.visas.findIndex(v => v.id === updated.id);
          if (index !== -1) this.visas[index] = updated;
          this.closeVisaModal();
          this.loadVisas();
        },
        error: err => console.error("Erreur update visa :", err)
      });
    } else {
      this.visaService.addVisa(this.devisId!, this.currentVisa).subscribe({
        next: (created) => {
          this.visas.push(created);
          this.closeVisaModal();
        },
        error: err => console.error("Erreur ajout visa :", err)
      });
    }
  }
  



  proposalSummary!: ProposalSummary;

loadProposalSummary(): void {
  if (!this.devisId) return;
  this.proposalSummaryService.getByDevisId(this.devisId).subscribe({
    next: (data) => this.proposalSummary = data,
    error: (err) => console.error("Erreur chargement résumé :", err)
  });
}

  }


