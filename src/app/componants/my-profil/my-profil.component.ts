import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/model/role.enum';
import { User } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-my-profil',
  templateUrl: './my-profil.component.html',
  styleUrls: ['./my-profil.component.css']
})
export class MyProfilComponent implements OnInit {
  user: User = {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    address: '',
    photoUrl: '',
    password: '',
    role: Role.ADMIN
  };
  isEditingPersonal = false;
  isEditingAddress = false;
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private authService: AuthService,private uploadService: UploadService ) {}

  ngOnInit(): void {
    this.loadUserData();
  }
getPhotoUrl(): string {
  if (!this.user || !this.user.photoUrl) return 'assets/avatar.png';

  // Supprime les doublons de /uploads/
  const cleanPath = this.user.photoUrl.replace(/^\/?uploads\//, '');
  return `http://localhost:8080/uploads/${cleanPath}`;
}

  loadUserData(): void {
    const email = this.authService.getUserEmail();
    console.log('Current user email:', email);
    
    if (!email) {
      this.errorMessage = 'No user email found in session';
      this.isLoading = false;
      return;
    }

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<User>(`http://localhost:8080/users/email/${email}`, { headers })
      .subscribe({
        next: (data) => {
          console.log('User data received:', data);
          this.user = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          this.errorMessage = 'Failed to load user data';
          this.isLoading = false;
        }
      });
  }

  toggleEditPersonal(): void {
    this.isEditingPersonal = !this.isEditingPersonal;
  }

  toggleEditAddress(): void {
    this.isEditingAddress = !this.isEditingAddress;
  }

  savePersonalInfo(): void {
    if (!this.user) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put<User>('http://localhost:8080/users/me', this.user, { headers })
      .subscribe({
        next: (updated) => {
          this.user = updated;
          this.isEditingPersonal = false;
        },
        error: (err) => {
          console.error('Error updating personal info:', err);
          this.errorMessage = 'Failed to update personal information';
        }
      });
  }

  saveAddressInfo(): void {
    if (!this.user) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put<User>('http://localhost:8080/users/me', this.user, { headers })
      .subscribe({
        next: (updated) => {
          this.user = updated;
          this.isEditingAddress = false;
        },
        error: (err) => {
          console.error('Error updating address:', err);
          this.errorMessage = 'Failed to update address information';
        }
      });
  }

  updatePhoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
  
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // ne PAS ajouter Content-Type ici
    });
  
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(this.user)], { type: 'application/json' }));
    formData.append("photo", file);
  
    this.http.patch('http://localhost:8080/users/me/general-infos', formData, { headers })
      .subscribe({
        next: (res) => console.log('✅ Upload réussi', res),
        error: (err) => console.error('❌ Erreur upload photo :', err)
      });
  }
  
  
  

  deletePhoto(): void {
    if (!this.user) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/users/me/photo`, { headers })

      .subscribe({
        next: () => {
          this.user.photoUrl = '';
        },
        error: (err) => {
          console.error('Error deleting photo:', err);
          this.errorMessage = 'Failed to delete photo';
        }
      });
  }

  passwordForm = {
  currentPassword: '',
  newPassword: '',
  confirmationPassword: ''
};

passwordError = '';
passwordSuccess = '';

changePassword(): void {
  const token = this.authService.getAccessToken();
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  this.http.patch('http://localhost:8080/users/change-password', this.passwordForm, { headers })
    .subscribe({
      next: () => {
        this.passwordSuccess = 'Mot de passe mis à jour avec succès';
        this.passwordError = '';
        this.passwordForm = { currentPassword: '', newPassword: '', confirmationPassword: '' };
      },
      error: (err) => {
        this.passwordSuccess = '';
        this.passwordError = err.error.message || 'Erreur lors de la mise à jour';
      }
    });
}

}