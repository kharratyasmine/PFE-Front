import * as bootstrap from 'bootstrap';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user.model';
import { Role } from 'src/app/model/role.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = Object.keys(Role).map(key => Role[key as keyof typeof Role]); // ✅ Conversion sécurisée
  selectedUserId: number | null = null;
  modalInstance: any;

  user: User = { 
    id: 0, 
    firstname: '',
    lastname: '',
    email: '', 
    motDePasse: '', 
    role: Role.USER
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles(); // 🔹 Charger les rôles au démarrage
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => { 
        console.log("✅ Utilisateurs chargés :", data);
        this.users = data; 
      },
      (error) => { 
        console.error('❌ Erreur lors du chargement des utilisateurs', error); 
      }
    );
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(
      (roles: string[]) => {
        console.log("✅ Rôles récupérés :", roles);
        this.roles = roles.map(role => Role[role as keyof typeof Role]);
      },
      (error) => {
        console.error('❌ Erreur lors du chargement des rôles', error);
      }
    );
  }

  openModal(): void {
    this.user = { id: 0, firstname: '', lastname: '', email: '', motDePasse: '', role: Role.USER };
    this.selectedUserId = null; // ✅ Réinitialisation
    this.showModal('userModal');
  }

  openEditModal(user: User): void {
    if (!user.id) {
      console.error("❌ Erreur : Impossible d'éditer un utilisateur sans ID !");
      return;
    }
    this.user = { ...user };
    this.selectedUserId = user.id;
    this.showModal('userModal');
  }

  saveUser(): void {
    if (this.selectedUserId) {
      // ✅ Mise à jour de l'utilisateur
      this.userService.updateUser(this.user).subscribe(() => {
        console.log("✅ Utilisateur mis à jour :", this.user);
        this.loadUsers();
        this.closeModal();
      },
      (error) => {
        console.error("❌ Erreur lors de la mise à jour de l'utilisateur", error);
      });
    } else {
      // ✅ Ajout d'un nouvel utilisateur
      this.userService.addUser(this.user).subscribe(() => {
        console.log("✅ Utilisateur ajouté :", this.user);
        this.loadUsers();
        this.closeModal();
      },
      (error) => {
        console.error("❌ Erreur lors de l'ajout de l'utilisateur", error);
      });
    }
  }

  deleteUser(id?: number): void {
    if (!id) {
      console.error("❌ Erreur : L'ID de l'utilisateur est indéfini !");
      return;
    }
    if (confirm("⚠️ Voulez-vous vraiment supprimer cet utilisateur ?")) {
      this.userService.deleteUser(id).subscribe(() => {
        console.log(`✅ Utilisateur avec ID ${id} supprimé.`);
        this.users = this.users.filter(u => u.id !== id);
      },
      (error) => {
        console.error("❌ Erreur lors de la suppression de l'utilisateur", error);
      });
    }
  }

  showModal(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    this.hideModal('userModal');
    this.selectedUserId = null;
  }

  hideModal(id: string): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    }
  }
}
