import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
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

  this.http.patch(`http://localhost:8080/users/${userId}/approval`, body).subscribe({
    next: () => {
      this.message = reject
        ? '❌ Utilisateur a été refusé avec succès.'
        : '✅ Uutilisateur a été approuvé avec succès.';
    },
    error: (err) => {
      console.error('❌ Erreur API :', err);
      this.message = '❌ Une erreur est survenue.';
    }
  });
}

}
