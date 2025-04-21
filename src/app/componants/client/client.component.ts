import { Component, OnInit } from '@angular/core';
import { Client } from 'src/app/model/client.model';
import { ClientService } from 'src/app/services/client.service';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  clients: Client[] = [];
  filteredClients: Client[] = [];
  modalInstance: any;
  selectedClient: Client = { id: 0, company: '',salesManagers: [], email: '', contact: '', address: '' };

  currentPage: number = 1;
  itemsPerPage: number = 6; // Nombre d'éléments par page
  translate: any;
  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    this.getClients();
  }

  /**
   * Charger les clients depuis l'API
   */
  getClients() {
    this.clientService.getAllClients().subscribe(data => {
      this.clients = data;
      this.filteredClients = data;
    });
  }


  /**
   * Ouvrir une modale Bootstrap.
   */
  private showModal(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  /**
   * Ouvrir la modale d'ajout/modification de client
   */
  openModal(client?: Client) {
    if (client) {
      this.selectedClient = { ...client }; // Copie de l'objet client existant
    } else {
      this.selectedClient = { id: 0, company: '',salesManagers: [], email: '', contact: '', address: '' };
    }
    (document.getElementById('clientModal') as HTMLDialogElement).showModal();
  }

  closeModal() {
    (document.getElementById('clientModal') as HTMLDialogElement).close();
  }

  /**
   * Ajouter ou modifier un client
   */
  saveClient(): void {
    // Préparation de l'objet client à envoyer
    const clientToSend: Client = {
      id: this.selectedClient.id && this.selectedClient.id > 0 ? this.selectedClient.id : undefined,
      company: this.selectedClient.company,
      salesManagers: this.selectedClient.salesManagers.filter(name => name.trim() !== ''),
      contact: this.selectedClient.contact,
      address: this.selectedClient.address,
      email: this.selectedClient.email
    };
  
    console.log("📤 Données envoyées :", JSON.stringify(clientToSend));
  
    if (this.selectedClient.id && this.selectedClient.id > 0) {
      // Mise à jour du client existant
      this.clientService.updateClient(this.selectedClient.id, clientToSend).subscribe(
        updatedClient => {
          console.log("✅ Client mis à jour :", updatedClient);
          this.getClients(); // Met à jour la liste visible
          this.closeModal(); // Ferme le formulaire/modal
        },
        error => {
          console.error("❌ Erreur mise à jour client", error);
          const errorMessage = error.error?.message || JSON.stringify(error.error) || "Erreur inconnue côté backend";
          alert(errorMessage);
        }
      );
    } else {
      // Création d'un nouveau client
      this.clientService.createClient(clientToSend).subscribe(
        newClient => {
          console.log("✅ Client ajouté :", newClient);
          this.getClients(); // Rafraîchit la liste
          this.closeModal(); // Ferme la modale
        },
        error => {
          console.error("❌ Erreur ajout client", error);
          const errorMessage = error.error?.message || JSON.stringify(error.error) || "Erreur inconnue côté backend";
          alert(errorMessage);
        }
      );
    }
  }
  


  /**
   * Supprimer un client
   */
  deleteClient(id: number): void {
    if (confirm("Voulez-vous supprimer ce client ?")) {
      this.clientService.deleteClient(id).subscribe(
        () => {
          console.log(`✅ Client supprimé avec succès.`);

          this.clients = this.clients.filter(client => client.id !== id);
          this.filteredClients = [...this.clients];
        },
        (error) => console.error('❌ Erreur suppression client', error)
      );
    }
  }
  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
  

  /**
   * Filtrer les clients par nom
   */
  searchClient(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.company.toLowerCase().includes(searchTerm) || 
      client.email.toLowerCase().includes(searchTerm)
    );
  }

  downloadExcel(): void {
    this.clientService.downloadExcel(this.clients).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Clients.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('❌ Erreur lors du téléchargement du fichier Excel :', error);
      }
    );
  }

  // Fonction de trackBy pour optimiser le *ngFor
trackByFn(index: number, item: any): number {
  return index;
}

// Gestion plus propre de l'ajout
addManager(): void {
  this.selectedClient.salesManagers = [...this.selectedClient.salesManagers, ''];
}

// Gestion plus propre de la suppression
removeManager(index: number): void {
  this.selectedClient.salesManagers = this.selectedClient.salesManagers.filter((_, i) => i !== index);
}

// Optionnel: Gestion de l'input
onManagerInput(index: number, event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.selectedClient.salesManagers[index] = value;
}
}
