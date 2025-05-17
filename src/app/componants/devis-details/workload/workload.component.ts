import { Component, Input, OnInit } from '@angular/core';
import { WorkloadDetail } from 'src/app/model/WorkloadDetail.model';
import { WorkloadDetailService } from 'src/app/services/WorkloadDetails.service';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-workload',
  templateUrl: './workload.component.html',
  styleUrls: ['./workload.component.css']
})
export class WorkloadComponent implements OnInit {
  @Input() devisId!: number | undefined;
  workloadDetails: WorkloadDetail[] = [];
  totalWorkload: number = 0;
  publicHolidaysText: string = '';
  publicHolidayInput: string = '';

  constructor(
    private workloadService: WorkloadDetailService,
    private route: ActivatedRoute
  ) {}

  selectedRow: WorkloadDetail = {
    id: undefined,
    period: '',
    estimatedWorkload: 0,
    publicHolidays: 0,
    publicHolidayDates: [],
    numberOfResources: 0,
    totalEstimatedWorkload: 0,
    note: '',
    devisId: undefined
  };
  
     ngOnInit(): void {
      if (this.devisId) {
        this.loadWorkloadDetails(this.devisId);
      } else {
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? +idParam : null;
        if (id) {
          this.devisId = id;
          this.loadWorkloadDetails(id);
        }
      }
    }
  
    loadWorkloadDetails(devisId: number): void {
      this.workloadService.getByDevisId(devisId).subscribe({
        next: (data) => {
          this.workloadDetails = data; // ✅ On garde ce que le backend a envoyé
          this.updateTotal(); // Recalcule le total général avec les vraies valeurs
        },
        error: (err) => {
          console.error("❌ Erreur lors du chargement :", err);
        }
      });
    }
    
  
    saveModifications(): void {
      // Sauvegarder chaque ligne
      this.workloadDetails.forEach(row => {
        this.workloadService.updateWorkloadDetail(row.id!, row).subscribe({
          next: () => console.log("✅ Ligne sauvegardée"),
          error: (err) => console.error("❌ Erreur sauvegarde ligne :", err)
        });
      });
    
      // ✅ Recalculer total général côté backend
      this.workloadService.getTotalWorkloadByDevisId(this.devisId!).subscribe({
        next: (total) => {
          this.totalWorkload = total;
          console.log("✅ Total général mis à jour :", total);
        },
        error: (err) => console.error("❌ Erreur calcul total backend :", err)
      });
    }
    
    
  
    recalculateTotal(row: WorkloadDetail): void {
      const estimated = row.estimatedWorkload || 0;
      const resources = row.numberOfResources || 0;
      row.totalEstimatedWorkload = estimated * resources;
      this.updateTotal();
    }
  
    private updateTotal(): void {
      this.totalWorkload = this.workloadDetails.reduce((sum, w) => sum + (w.totalEstimatedWorkload || 0), 0);
    }

    openEditModal(row: WorkloadDetail): void {
      this.selectedRow = { ...row };
      this.publicHolidayInput = row.publicHolidayDates?.join(', ') || '';
      const modalEl = document.getElementById('editWorkloadModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    }
    
    updateRow(): void {
      if (!this.selectedRow?.id) return;
    
      // 💡 Mise à jour des jours fériés (si modifiés via input texte)
      this.selectedRow.publicHolidayDates = this.publicHolidayInput
        .split(',')
        .map(date => date.trim())
        .filter(date => !!date); // évite les vides
    
      // ❌ SUPPRIMÉ : recalcul automatique de totalEstimatedWorkload ici
      // => on laisse l'utilisateur le modifier librement dans le modal
    
      this.workloadService.updateWorkloadDetail(this.selectedRow.id, this.selectedRow).subscribe({
        next: () => {
          const index = this.workloadDetails.findIndex(w => w.id === this.selectedRow.id);
          if (index !== -1) {
            this.workloadDetails[index] = { ...this.selectedRow };
            this.updateTotal();
          }
    
          const modal = bootstrap.Modal.getInstance(document.getElementById('editWorkloadModal')!);
          modal?.hide();
        },
        error: (err) => console.error("❌ Erreur mise à jour :", err)
      });
    }
    
    
     
  }
  

