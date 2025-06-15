import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Injection to get route parameters
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DevisService } from '../../services/devis.service';
import { Devis } from 'src/app/model/devis.model';
import { DevisDetailsComponent } from '../devis-details/devis-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
  
  devisForm: FormGroup;
  devisList: Devis[] = [];
  editing = false;
  selectedDevisId?: number;
  selectedDevis: Devis | null = null; // Pour le modal
  isModalEditOpen = false;
  projectId: number | null = null;
  @Input() devisId!: number;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math = Math; // Pour utiliser Math dans le template

  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private route: ActivatedRoute   ,// Injection to get the projectId from the route,
    private modalService: NgbModal
  ) {
    this.devisForm = this.fb.group({
      reference: ['', Validators.required],
      edition: [''],
      creationDate: [new Date()],
      totalCost: [null, Validators.min(0)],
      status: [''],
      proposalValidity: [''],
      author: ['']
    });
  }
  openDevisDetailsModal(devisId: number): void {
    const modalRef = this.modalService.open(DevisDetailsComponent, { size: 'xl', scrollable: true });
    modalRef.componentInstance.devisId = devisId;
  }


  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      const idParam = params['id'];
      this.projectId = idParam ? +idParam : null;
      if (this.projectId) {
        this.loadDevis();
      }
    });
  }

  loadDevis(): void {
    if (this.projectId) {
      this.devisService.getDevisByProject(this.projectId).subscribe({
        next: (data) => this.devisList = data,
        error: (error) => console.error('Error loading devis for project:', error)
      });
    } else {
      this.devisService.getAllDevis().subscribe({
        next: (data) => this.devisList = data,
        error: (error) => console.error('Error loading devis:', error)
      });
    }
  }

  onSubmit(): void {
    if (this.devisForm.invalid) {
      return;
    }

    const devis: Devis = this.devisForm.value;

    if (this.editing && this.selectedDevisId) {
      this.devisService.updateDevis(this.selectedDevisId, devis).subscribe({
        next: () => {
          this.loadDevis();
          this.resetForm();
        },
        error: (error) => console.error('Error updating devis:', error)
      });
    } else {
      this.devisService.createDevis(devis).subscribe({
        next: () => {
          this.loadDevis();
          this.resetForm();
        },
        error: (error) => console.error('Error creating devis:', error)
      });
    }
  }

  editDevis(devis: Devis): void {
    this.selectedDevis = { ...devis }; // Clone pour modification
    this.isModalEditOpen = true;
  }

  closeEditModal(): void {
    this.isModalEditOpen = false;
    this.selectedDevis = null;
  }

  saveEditedDevis(): void {
    if (this.selectedDevis && this.selectedDevis.id) {
      this.devisService.updateDevis(this.selectedDevis.id, this.selectedDevis).subscribe({
        next: () => {
          this.loadDevis();
          this.closeEditModal();
        },
        error: (error) => console.error('Erreur lors de la mise à jour du devis :', error)
      });
    }
  }

  deleteDevis(id: number): void {
    if (confirm("Are you sure you want to delete this devis?")) {
      this.devisService.deleteDevis(id).subscribe({
        next: () => this.loadDevis(),
        error: (error) => console.error('Error deleting devis:', error)
      });
    }
  }

  resetForm(): void {
    this.devisForm.reset({ creationDate: new Date(), status: 'PENDING' });
    this.editing = false;
    this.selectedDevisId = undefined;
  }

    downloadWord(): void {
    if (this.devisId) {
      this.devisService.downloadDevisWord(this.devisId);
    }
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Réinitialiser à la première page
  }

  isOverdue(date: Date): boolean {
    const creationDate = new Date(date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return creationDate < thirtyDaysAgo;
  }

  isNearDeadline(date: Date): boolean {
    const creationDate = new Date(date);
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    return creationDate >= twentyDaysAgo && creationDate < new Date();
  }
}