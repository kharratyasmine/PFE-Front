import { Component, Input, OnInit } from '@angular/core';
import { FinancialDetail } from 'src/app/model/FinancialDetail.model';
import { ActivatedRoute } from '@angular/router';
import { FinancialDetailService } from 'src/app/services/financialDetail.service';

@Component({
  selector: 'app-financial',
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.css']
})
export class FinancialComponent implements OnInit {
  @Input() devisId!: number | undefined;
  financialDetails: FinancialDetail[] = [];
  totalCost: number = 0;

  constructor(
    private financialService: FinancialDetailService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifie si l'ID est fourni par le parent
    if (this.devisId) {
      this.loadFinancialDetails(this.devisId);
    } else {
      // Sinon, essaie de le récupérer depuis l'URL (cas accès direct via /devisDetails/:id)
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.devisId = id;
        this.loadFinancialDetails(id);
      }
    }
  }

  loadFinancialDetails(devisId: number): void {
    this.financialService.getByDevisId(devisId).subscribe({
      next: (data) => {
        this.financialDetails = data;
        this.totalCost = data.reduce((acc, item) => acc + (item.totalCost || 0), 0);
        console.log("✅ Données financières chargées :", data);
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des données financières :", err);
      }
    });
  }
  
}
