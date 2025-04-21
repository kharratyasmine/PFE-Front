import { Component, Input, OnInit } from '@angular/core';
import { InvoicingDetail } from 'src/app/model/InvoicingDetail.model';
import { InvoicingDetailService } from 'src/app/services/InvoicingDetail.service';

@Component({
  selector: 'app-invoicing',
  templateUrl: './invoicing.component.html'
})
export class InvoicingComponent implements OnInit {
  @Input() devisId!: number | undefined;
  invoicingDetails: InvoicingDetail[] = [];
  selectedMonth = 1;
  totalAmount: number = 0;
  route: any;


  constructor(private invoicingService: InvoicingDetailService) {}
  ngOnInit(): void {
    // Vérifie si l'ID est fourni par le parent
    if (this.devisId) {
      this.loadinvoicingDetails(this.devisId);
    } else {
      // Sinon, essaie de le récupérer depuis l'URL (cas accès direct via /devisDetails/:id)
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.devisId = id;
        this.loadinvoicingDetails(id);
      }
    }
  }
  loadinvoicingDetails(devisId: number): void {
    this.invoicingService.getByDevisId(devisId).subscribe({
      next: (data) => {
        this.invoicingDetails = data;
        this.totalAmount = data.reduce((acc, item) => acc + (item.amount || 0), 0);
        console.log("✅ Données financières chargées :", data);
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des données financières :", err);
      }
    });
  }
}
