import { Component, OnInit } from '@angular/core';
import { TeamMemberService } from '../../services/team-member.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UploadService } from 'src/app/services/upload.service';
import { TeamMember } from 'src/app/model/TeamMember.model';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.css']
})
export class TeamMemberComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  filteredMembers: TeamMember[] = [];
  files: File[] = [];
  imageUrl: string = "";
  imageUploaded: boolean = false;
  costModified: boolean = false;
  roleModified: boolean = false;
  initialModified: boolean = false;
  selectedMember: TeamMember = this.getEmptyTeamMember();

  currentPage: number = 1;
  itemsPerPage: number = 4; // Nombre d'éléments par page

  constructor(
    private teamMemberService: TeamMemberService,
    private uploadService: UploadService,
    
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  // Gestion de l'upload d'image
  onSelect(event: any): void {
    console.log("📂 Fichiers ajoutés :", event);
    this.files.push(...event.addedFiles);
    this.uploadFiles();
  }

 uploadFiles(): void {
  if (!this.files[0]) {
    alert("Veuillez sélectionner une image.");
    return;
  }

  const file = this.files[0];
  const formData = new FormData();
  formData.append("image", file);

  this.uploadService.uploadTeamMemberImage(this.selectedMember.id!, formData)
    .subscribe({
      next: (res: any) => {
        console.log("✅ Image enregistrée localement :", res);
        this.selectedMember.image = res.imagePath;
        this.imageUploaded = true;
      },
      error: (err) => {
        console.error("❌ Erreur upload image :", err);
      }
    });
}


  onRemove(file: File): void {
    console.log("🗑 Fichier retiré :", file);
    const index = this.files.indexOf(file);
    if (index >= 0) {
      this.files.splice(index, 1);
    }
  }

  loadTeamMembers(): void {
    this.teamMemberService.getAllTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
        // Dupliquer dans filteredMembers pour la recherche et la pagination
        this.filteredMembers = [...members];
        console.log("Liste des membres récupérée :", members);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des membres :", err);
      }
    });
  }

  // Recherche de membres par nom
  searchMemberByName(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('🔍 Recherche de membre :', searchTerm);
    this.filteredMembers = this.teamMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    console.log('✅ Membres filtrés :', this.filteredMembers);
  }

  // Supprimer un membre
  deleteTeamMember(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer ce membre ?")) {
      this.teamMemberService.deleteTeamMember(id).subscribe(
        () => {
          console.log("✅ Membre supprimé.");
          this.teamMembers = this.teamMembers.filter(member => member.id !== id);
          this.filteredMembers = [...this.teamMembers];
        },
        (error) => {
          console.error("❌ Erreur lors de la suppression du membre", error);
          alert("Erreur lors de la suppression du membre : " + error.message);
        }
      );
    }
  }

  senioriteOptions: string[] = ['JUNIOR', 'INTERMEDIAIRE', 'SENIOR', 'SENIOR_MANAGER'];

  // Créer un objet TeamMember vide
  getEmptyTeamMember(): TeamMember {
    return {
      id: null,
      name: '',
      initial: '',
      jobTitle: '',
      holiday: [],
      image: '',
      note: '',
      role: '',
      cost: 0,
      experienceRange: '',
      startDate: '',
      teams: [],
    
    };
  }
  updateExperienceFromStartDate(): void {
    if (!this.selectedMember?.startDate) return;
  
    const start = new Date(this.selectedMember.startDate);
    const now = new Date();
  
    const diffInMs = now.getTime() - start.getTime();
    const years = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
    const fullYears = Math.floor(years);
  
    // 📊 Calculer la plage d'expérience
    this.selectedMember.experienceRange = `${fullYears} - ${fullYears + 1} Year${fullYears + 1 > 1 ? 's' : ''}`;
  
    // 🎓 Suggérer un rôle automatiquement (si pas modifié manuellement)
    if (!this.roleModified) {
      if (fullYears <= 2) {
        this.selectedMember.role = 'JUNIOR';
      } else if (fullYears <= 6) {
        this.selectedMember.role = 'INTERMEDIAIRE';
      } else if (fullYears <= 12) {
        this.selectedMember.role = 'SENIOR';
      } else {
        this.selectedMember.role = 'SENIOR_MANAGER';
      }
    }
  
    // 💰 Mettre à jour le coût si nécessaire
    this.onSeniorityChange();
  }
  
  getExperienceLabel(exp: number | undefined): string {
    if (!exp) return '0 - 1 an';
    if (exp <= 1) return '0 - 1 an';
    if (exp <= 2) return '1 - 2 ans';
    if (exp <= 3) return '2 - 3 ans';
    if (exp <= 5) return '3 - 5 ans';
    if (exp <= 10) return '6 - 10 ans';
    return '10+ ans';
  }
  

  // Ajouter une date de congé
  addHoliday(date: string): void {
    if (date && !this.selectedMember.holiday.includes(date)) {
      this.selectedMember.holiday.push(date);
    }
  }

  // Retirer une date de congé
  removeHoliday(date: string): void {
    this.selectedMember.holiday = this.selectedMember.holiday.filter(d => d !== date);
  }

  // Enregistrer ou mettre à jour un membre
  saveTeamMember(): void {
    if (this.selectedMember.id && this.selectedMember.id !== 0) {
      this.teamMemberService.updateTeamMember(this.selectedMember.id, this.selectedMember).subscribe(
        (updatedMember) => {
          console.log("✅ Membre mis à jour :", updatedMember);
          this.loadTeamMembers();
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur lors de la mise à jour du membre", error);
        }
      );
    } else {
      this.teamMemberService.addTeamMember(this.selectedMember).subscribe(
        (newMember) => {
          console.log("✅ Membre ajouté :", newMember);
          this.teamMembers.push(newMember);
          this.filteredMembers = [...this.teamMembers];
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur lors de l'ajout du membre", error);
        }
      );
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('teamMemberModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
  

  openModal(member?: TeamMember): void {
    if (member) {
      this.selectedMember = { ...member };
    } else {
      this.selectedMember = this.getEmptyTeamMember();
    }
    this.costModified = false;
    this.initialModified = false;
  
    const modalElement = document.getElementById('teamMemberModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  downloadExcel(): void {
    this.teamMemberService.downloadExcel(this.teamMembers).pipe(
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement Excel : ', error);
        return throwError(error);
      })
    ).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teamsMembers.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    );
  }
  onExperienceChange(): void {
    const range = this.selectedMember.experienceRange;
  
    if (!range || this.roleModified) return;
  
    // 🧠 Extraire le nombre de départ (ex: "2 - 3 Years" → 2)
    const match = range.match(/^(\d+)\s*-/);
    const startYear = match ? parseInt(match[1], 10) : 0;
  
    // 🎓 Suggérer le rôle en fonction de l’expérience
    if (startYear <= 2) {
      this.selectedMember.role = 'JUNIOR';
    } else if (startYear <= 6) {
      this.selectedMember.role = 'INTERMEDIAIRE';
    } else if (startYear <= 12) {
      this.selectedMember.role = 'SENIOR';
    } else {
      this.selectedMember.role = 'SENIOR_MANAGER';
    }
  
    // 💰 Mettre à jour le coût
    this.onSeniorityChange();
  }

  onSeniorityChange(): void {
    if (!this.costModified) {
      const seniority = this.selectedMember.role;
      let defaultCost = 200;
      switch (seniority) {
        case 'JUNIOR':
          defaultCost = 200;
          break;
        case 'INTERMEDIAIRE':
          defaultCost = 350;
          break;
        case 'SENIOR':
          defaultCost = 500;
          break;
        case 'SENIOR_MANAGER':
          defaultCost = 800;
          break;
        default:
          defaultCost = 200;
      }
      this.selectedMember.cost = defaultCost;
    }
  }


  generateInitial(): void {
    const parts = this.selectedMember.name.trim().split(' ');
    if (parts.length < 2) return;
  
    const prenom = parts[0].toUpperCase(); // ex: YASMINE
    const nom = parts[1].toUpperCase();    // ex: KHARRAT
  
    let baseInitial = prenom.substring(0, 2) + nom.charAt(0); // YA + K = YAK
    let uniqueInitial = baseInitial;
    let counter = 1;
  
    const existingInitials = this.teamMembers
      .map(m => m.initial?.toUpperCase())
      .filter(init => init !== this.selectedMember.initial); // exclure lui-même
  
    while (existingInitials.includes(uniqueInitial)) {
      if (prenom.length > 2 + counter) {
        uniqueInitial = prenom.substring(0, 2 + counter) + nom.charAt(0);
      } else {
        uniqueInitial = baseInitial + counter;
      }
      counter++;
    }
  
    this.selectedMember.initial = uniqueInitial;
  }
  
  onNameChange(): void {
    if (!this.initialModified) {
      this.generateInitial();
    }
  }
  
}