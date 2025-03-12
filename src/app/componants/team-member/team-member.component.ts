import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { TeamMemberService } from '../../services/team-member.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { Seniorite } from 'src/app/model/seniorite.enum';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.css']
})
export class TeamMemberComponent implements OnInit {

  teamMembers: TeamMember[] = [];
  filteredMembers: TeamMember[] = []; // ✅ Liste pour recherche filtrée
  files: File[] = [];
  imageUrl: string = "";
  imageUploaded: boolean = false;

  seniorite = Seniorite; // ✅ Correction de la référence
  senioriteKeys = Object.keys(Seniorite).filter(key => isNaN(Number(key))) as (keyof typeof Seniorite)[];
  SenioriteList = Object.values(Seniorite) as Seniorite[]; // ✅ Assurez-vous que c'est bien un tableau du type `Seniorite`

  selectedMember: TeamMember = {
    id: 0,
    name: '',
    initial: '',
    allocation: 0,
    teamRole: '',
    holiday: '',
    dateEmbauche: '',
    seniorite: Seniorite.JUNIOR,
    cout: 0,
    affectations: [],
    tasks: [],
    team: null,
    note: '',
    image: ''
  };

  modalInstance: any;

  constructor(
    private teamMemberService: TeamMemberService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  getSenioriteLabel(seniorite: Seniorite): string {
    const labels: { [key in Seniorite]: string } = {
      [Seniorite.JUNIOR]: "Junior ",
      [Seniorite.INTERMEDIAIRE]: "intermediare",
      [Seniorite.Senior]: "Senior",
      [Seniorite.SeniorManager]: "Senior Manager"
    };
    return labels[seniorite] || "Inconnu";
  }
  
  /** 🔄 Charge la liste des membres depuis le backend */
  loadTeamMembers(): void {
    this.teamMemberService.getTeamMembers().subscribe(
      (data) => {
        console.log("✅ Membres récupérés :", data);
        this.teamMembers = data || []; // ✅ Évite une erreur si `data` est `null`
        this.filteredMembers = [...this.teamMembers];
      },
      (error) => {
        console.error('❌ Erreur chargement teamMembers', error);
      }
    );
  }

  /** ✨ Ouvre la modale pour ajouter ou modifier un membre */
  openModal(teamMember?: TeamMember): void {
    this.selectedMember = teamMember 
      ? { ...teamMember } 
      : {
          id: 0,
          name: '',
          initial: '',
          allocation: 0,
          teamRole: '',
          holiday: '',
          dateEmbauche: '',
          seniorite: Seniorite.JUNIOR,
          cout: 0,
          affectations: [],
          tasks: [],
          team: null,
          note: '',
          image: ''
        };

    const modal = document.getElementById('teamMemberModal');
    if (modal) {
      (modal as any).showModal();
    }
  }

  /** ❌ Ferme la modale */
  closeModal(): void {
    const modal = document.getElementById('teamMemberModal');
    if (modal) {
      (modal as any).close();
    }
  }

  /** ✅ Enregistre ou met à jour un membre */
  saveTeamMember(): void {
    console.log("📤 Données envoyées :", this.selectedMember);

    // ✅ Vérifier que `teamRole` n'est pas `null`
    if (!this.selectedMember.teamRole) {
      this.selectedMember.teamRole = "Aucun rôle défini";
    }

    if (this.selectedMember.id) {
      // 🔄 Mise à jour
      this.teamMemberService.updateTeamMember(this.selectedMember.id, this.selectedMember).subscribe(
        (updatedMember) => {
          console.log("📥 Réponse backend après update :", updatedMember);
          this.loadTeamMembers();  
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur mise à jour membre", error);
        }
      );
    } else {
      // ➕ Ajout d'un nouveau membre
      this.teamMemberService.addTeamMember(this.selectedMember).subscribe(
        (newMember) => {
          console.log("✅ Membre ajouté :", newMember);
          this.selectedMember = { ...newMember };
          this.teamMembers.push(newMember);
          this.closeModal();
        },
        (error) => {
          console.error("❌ Erreur ajout membre", error);
        }
      );
    }
  }

  /** 🗑 Supprime un membre */
  deleteTeamMember(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer ce membre ?")) {
      this.teamMemberService.deleteTeamMember(id).subscribe(
        () => {
          console.log(`✅ Membre supprimé.`);
          this.teamMembers = this.teamMembers.filter(member => member.id !== id);
          this.filteredMembers = [...this.teamMembers];
        },
        (error) => {
          console.error("❌ Erreur suppression membre", error);
          alert("Erreur lors de la suppression du membre : " + error.message);
        }
      );
    }
  }

  /** 🔍 Recherche de membres */
  searchMemberByName(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('🔍 Recherche de membre :', searchTerm);

    this.filteredMembers = this.teamMembers.filter(member => 
      member.name.toLowerCase().includes(searchTerm)
    );

    console.log('✅ Membres filtrés :', this.filteredMembers);
  }

  /** 📥 Télécharge la liste des membres en Excel */
  downloadExcel(): void {
    this.teamMemberService.downloadExcel(this.teamMembers).pipe(
      catchError(error => {
        console.error('❌ Erreur téléchargement Excel : ', error);
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

  /** 📤 Gère l'upload d'image */
  uploadFiles(): void {
    if (!this.files[0]) {
      alert("Please upload an image.");
      return;
    }
  
    const file_data = this.files[0];
    const data = new FormData();
    data.append('file', file_data);
    data.append('upload_preset', 'PFE-Workpilot');  // 🔥 Remplace par ton `upload_preset` correct
    data.append('cloud_name', 'dvvr5uv1d');  // 🔥 Remplace par ton Cloud Name
  
    this.uploadService.uploadImage(data).subscribe(
      (res: any) => {
        console.log("✅ Image uploadée sur Cloudinary :", res);
  
        // 🔥 Mettre à jour l'image du membre avec l'URL renvoyée
        this.imageUrl = res.url;
        this.selectedMember.image = res.url;  // Met à jour l'objet du membre
  
        // Activer un drapeau pour montrer que l'image a été uploadée
        this.imageUploaded = true;
      },
      (error) => {
        console.error("❌ Erreur lors de l'upload de l'image", error);
      }
    );
  }
  

  /** 🖼 Drag & Drop Image */
  onSelect(event: any): void {
    console.log("📂 Fichiers ajoutés :", event);
    this.files.push(...event.addedFiles);
    this.uploadFiles();
  }

  onRemove(event: any): void {
    console.log("🗑 Fichier retiré :", event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
