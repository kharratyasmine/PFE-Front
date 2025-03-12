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
  
  selectedClient: Client = {
    id: 0,
    name: '',
    email: '',
    contact: '',
    address: ''
  };
  

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  /**
   * Charger les clients depuis l'API
   */
  loadClients(): void {
    this.clientService.getAllClients().subscribe(
        (response) => {
            console.log('📌 Réponse brute du backend :', response);
            this.clients = response as Client[];  // S'assurer que c'est bien un tableau d'objets Client
            this.filteredClients = [...this.clients];
        },
        (error) => {
            console.error('❌ Erreur chargement clients', error);
            console.log("📌 Détails de l'erreur :", error.message);
            console.log("📌 Réponse complète :", error);
        }
    );
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
  openModal(client?: Client): void {
     this.selectedClient = client ? { ...client } : {
       id: 0,
       name: '',
       address:'',
       contact:'',
       email:'' 
     };
     const modal = document.getElementById('clientModal');
     if (modal) {
       (modal as any).showModal();
     }
   }
 

  /**
   * Fermer la modale
   */
  closeModal(): void {
    const modal = document.getElementById('clientModal');
    if (modal) {
      (modal as any).close();
    }
  }

  /**
   * Ajouter ou modifier un client
   */
  saveClient(): void {
    console.log("📤 Données envoyées :", JSON.stringify(this.selectedClient));

    if (this.selectedClient.id) {
        this.clientService.updateClient(this.selectedClient.id, this.selectedClient).subscribe(
            (updatedClient) => {
                console.log("✅ Client mis à jour :", updatedClient);
                this.loadClients();
                this.closeModal();
            },
            (error) => {
                console.error("❌ Erreur mise à jour client", error);
            }
        );
    } else {
        this.clientService.createClient(this.selectedClient).subscribe(
            (newClient) => {
                console.log("✅ Client ajouté :", newClient);
                this.loadClients();
                this.closeModal();
            },
            (error) => {
                console.error("❌ Erreur ajout client", error);
                console.log("📌 Détails erreur :", error.message);
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

  /**
   * Filtrer les clients par nom
   */
  searchClient(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(client => client.name.toLowerCase().includes(searchTerm));
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
}
