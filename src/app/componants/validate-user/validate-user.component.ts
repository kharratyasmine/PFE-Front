import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validate-user',
  template: `
    <div class="container mt-5 text-center">
      <h2>{{ message }}</h2>
    </div>
  `,
  styles: []
})
export class ValidateUserComponent implements OnInit {
  message = 'Traitement en cours...';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const reject = this.route.snapshot.queryParamMap.get('reject') === 'true';

    if (!userId) {
      this.message = '❌ Aucun ID utilisateur reçu.';
      return;
    }

    const body = reject
      ? { approved: false, reason: 'Refusé depuis lien email' }
      : { approved: true };

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.patch(`http://localhost:8080/users/${userId}/approval`, body, { headers }).subscribe({
      next: () => {
        this.message = reject
          ? '❌ Utilisateur a été refusé avec succès.'
          : '✅ Utilisateur a été approuvé avec succès.';
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
        this.message = '❌ Une erreur est survenue.';
      }
    });
  }
}