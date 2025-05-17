import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Psr } from 'src/app/model/psr.model';
import { PsrService } from 'src/app/services/psr.service';

@Component({
  selector: 'app-psr-planning',
  templateUrl: './psr-planning.component.html',
  styleUrls: ['./psr-planning.component.css']
})
export class PsrPlanningComponent {
@Input() psrId!: number | undefined;
@Input() psr!: Psr;


  constructor(
    private psrService: PsrService,
     private route: ActivatedRoute
 
  ) {}


    ngOnInit(): void {
    // Vérifie si l'ID est fourni par le parent
    if (this.psrId) {
      this.loadPlanning(this.psrId);
    } else {
    
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.psrId = id;
        this.loadPlanning(id);
      }
    }
  }

  loadPlanning(psrId: number): void {
   
  }
}
