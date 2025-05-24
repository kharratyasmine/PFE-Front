import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Psr } from 'src/app/model/psr.model';
import { PsrService } from 'src/app/services/psr.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-psr-cover',
  templateUrl: './psr-cover.component.html',
  styleUrls: ['./psr-cover.component.css']
})
export class PsrCoverComponent implements OnInit {

  psr!: Psr;
  modalRef: any;
  actions = [
    { type: 'Prepared', name: '', date: '' },
    { type: 'Verified', name: '', date: '' },
    { type: 'Approved', name: '', date: '' }
  ];
  
  // Utilisateurs
  users: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private psrService: PsrService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.route.parent?.paramMap.subscribe(params => {
      const psrId = params.get('psrId');
      const projectId = params.get('projectId');

      if (psrId) {
        this.psrService.getById(+psrId).subscribe({
          next: (data) => {
            this.psr = data;
            console.log("✅ PSR chargé :", data);
          },
          error: (err) => {
            console.error("❌ Erreur de chargement du PSR :", err);
            alert("Impossible de charger le PSR.");
          }
        });
      } else {
        alert("ID du PSR non trouvé dans l'URL.");
      }
    });
  }
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data.map((u: any) => u.fullName), // ou juste `u.name`
      error: (err) => console.error('Erreur chargement users', err)
    });
  }
  openEditModal(content: any): void {
    this.modalRef = this.modalService.open(content, { centered: true, size: 'lg' });
  }
  
  save(modal: any): void {
    // ✅ Ajout des actions avant l'envoi
    this.psr.actions = this.actions;
  
    this.psrService.updatePsr(this.psr.id!, this.psr).subscribe({
      next: () => {
        alert("✅ Cover Page mise à jour !");
        modal.close();
      },
      error: () => {
        alert("❌ Erreur lors de la mise à jour.");
      }
    });
  }
  
  onUserChange(type: 'prepared' | 'approved' | 'validated'): void {
    const now = new Date();
    if (type === 'prepared') {
      this.psr.preparedByDate = now;
    } else if (type === 'approved') {
      this.psr.approvedByDate = now;
    } else if (type === 'validated') {
      this.psr.validatedByDate = now;
    }
  }
  addAction() {
    this.actions.push({ type: '', name: '', date: '' });
  }
  
  removeAction(index: number) {
    this.actions.splice(index, 1);
  }
  
}