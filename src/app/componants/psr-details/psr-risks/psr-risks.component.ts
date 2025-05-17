import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Psr } from 'src/app/model/psr.model';
import { PsrService } from 'src/app/services/psr.service';

@Component({
  selector: 'app-psr-risks',
  templateUrl: './psr-risks.component.html',
  styleUrls: ['./psr-risks.component.css']
})
export class PsrRisksComponent {
@Input() psrId!: number | undefined;
@Input() psr!: Psr;


  constructor(
    private psrService: PsrService,
     private route: ActivatedRoute
 
  ) {}

   ngOnInit(): void {
    // Vérifie si l'ID est fourni par le parent
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
    
  }
}


