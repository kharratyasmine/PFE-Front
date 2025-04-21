import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/model/role.enum';
import { User } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

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
    role: Role.USER
  };
  isEditingPersonal = false;
  isEditingAddress = false;
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
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

    this.http.put<User>(`http://localhost:8080/users/${this.user.id}`, this.user, { headers })
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

    this.http.put<User>(`http://localhost:8080/users/${this.user.id}`, this.user, { headers })
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
    if (!file || !this.user) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`http://localhost:8080/users/${this.user.id}/photo`, formData, { headers })
      .subscribe({
        next: () => this.loadUserData(),
        error: (err) => {
          console.error('Error uploading photo:', err);
          this.errorMessage = 'Failed to upload photo';
        }
      });
  }

  deletePhoto(): void {
    if (!this.user) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/users/${this.user.id}/photo`, { headers })
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
}