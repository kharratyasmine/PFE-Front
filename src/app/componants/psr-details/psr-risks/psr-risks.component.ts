import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { Psr } from 'src/app/model/psr.model';
import { Risk } from 'src/app/model/risk.model';
import { PsrService } from 'src/app/services/psr.service';
import { RiskService } from 'src/app/services/risk.service';

@Component({
  selector: 'app-psr-risks',
  templateUrl: './psr-risks.component.html',
  styleUrls: ['./psr-risks.component.css']
})
export class PsrRisksComponent implements OnInit {

  @Input() psrId!: number | undefined;
  @Input() psr!: Psr;
  risks: Risk[] = [];
editingRisk: Risk = this.getEmptyRisk();
  constructor(
    private psrService: PsrService,
    private riskService: RiskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.psrId) {
      this.loadRisks(this.psrId);
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.psrId = id;
        this.loadRisks(id);
      }
    }
  }

  loadRisks(psrId: number): void {
    this.riskService.getRisksByPsr(psrId).subscribe((risks) => {
      this.risks = risks;
    });
  }
deleteRisk(riskId: number): void {
  if (confirm('Are you sure you want to delete this risk?')) {
    this.riskService.deleteRisk(riskId).subscribe({
      next: () => {
        if (this.psrId) this.loadRisks(this.psrId);
      },
      error: (err) => {
        console.error("❌ Error deleting risk:", err);
        alert("An error occurred while deleting the risk.");
      }
    });
  }
}


openAddModal(): void {
  this.editingRisk = this.getEmptyRisk();
  const modalEl = document.getElementById('riskModal');
  if (modalEl) {
    new bootstrap.Modal(modalEl).show();
  }
}

editRisk(risk: Risk): void {
  this.editingRisk = { ...risk };
  const modalEl = document.getElementById('riskModal');
  if (modalEl) {
    new bootstrap.Modal(modalEl).show();
  }
}

closeModal(): void {
  const modalEl = document.getElementById('riskModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
}

saveRisk(): void {
  if (!this.psrId) return;

  if (this.editingRisk.id && this.editingRisk.id !== 0) {
    this.riskService.updateRisk(this.psrId, this.editingRisk).subscribe(() => {
      this.loadRisks(this.psrId!);
      this.closeModal();
    });
  } else {
    this.riskService.addRisk(this.psrId, this.editingRisk).subscribe(() => {
      this.loadRisks(this.psrId!);
      this.closeModal();
    });
  }
}

getEmptyRisk(): Risk {
  return {
    id: 0,
    description: '',
    origin: '',
    category: '',
    openDate: '',
    dueDate: '',
    causes: '',
    consequences: '',
    appliedMeasures: '',
    probability: '',
    gravity: '',
    criticality: '',
    measure: '',
    riskAssessment: '',
    riskTreatmentDecision: '',
    justification: '',
    idAction: '',
    riskStat: '',
    closeDate: '',
    impact: '',
    mitigationPlan: ''
  };
}


}


