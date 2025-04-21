import { Component, Input, OnInit } from '@angular/core';
import { WorkloadDetail } from 'src/app/model/WorkloadDetail.model';
import { WorkloadDetailService } from 'src/app/services/WorkloadDetails.service';

@Component({
  selector: 'app-workload',
  templateUrl: './workload.component.html',
  styleUrls: ['./workload.component.css']
})
export class WorkloadComponent implements OnInit {
  @Input() devisId!: number | undefined;
  workloadDetails: WorkloadDetail[] = [];
  totalWorkload: number = 0;
  route: any;

    ngOnInit(): void {
      // Vérifie si l'ID est fourni par le parent
      if (this.devisId) {
        this.loadWorkloadDetails(this.devisId);
      } else {
        // Sinon, essaie de le récupérer depuis l'URL (cas accès direct via /devisDetails/:id)
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? +idParam : null;
        if (id) {
          this.devisId = id;
          this.loadWorkloadDetails(id);
        }
      }
    }
  constructor(private workloadService: WorkloadDetailService) {}

loadWorkloadDetails(devisId: number): void {
  this.workloadService.getByDevisId(devisId).subscribe({
    next: (data) => {
      this.workloadDetails = data;
      this.totalWorkload = data.reduce((sum, w) => sum + w.estimatedWorkload, 0);
      console.log("✅ Données financières chargées :", data);
      this.chunkWorkloadDetails();
    },
    error: (err) => {
      console.error("❌ Erreur lors du chargement des données financières :", err);
    }
  });
}
workloadChunks: WorkloadDetail[][] = [];
private chunkWorkloadDetails(): void {
  const chunkSize = 3;
  this.workloadChunks = [];
  for (let i = 0; i < this.workloadDetails.length; i += chunkSize) {
    this.workloadChunks.push(this.workloadDetails.slice(i, i + chunkSize));
  }
}
saveModifications(): void {
  this.workloadDetails.forEach(row => {
    this.workloadService.updateWorkloadDetail(row.id!, row).subscribe({
      next: () => console.log("✅ Workload mis à jour :", row),
      error: (err) => console.error("❌ Erreur mise à jour :", err)
    });
  });
}
getChunkTotal(chunk: WorkloadDetail[]): number {
  return chunk.reduce((acc, item) => acc + item.estimatedWorkload, 0);
}

}