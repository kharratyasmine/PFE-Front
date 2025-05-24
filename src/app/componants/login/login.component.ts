import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

login(): void {
  if (this.loginForm.invalid) {
    this.errorMessage = '⚠️ Veuillez remplir tous les champs correctement.';
    return;
  }

  this.errorMessage = '';
  this.loading = true;

  const credentials = this.loginForm.value;

  this.authService.login(credentials).subscribe({
    next: (response) => {
      console.log('✅ Authentification réussie:', response);
      this.authService.saveToken(response.access_token, response.refresh_token);

      const role = this.authService.getCurrentUserRole();

      // 🔁 Redirection selon le rôle
      switch (role) {
        case 'ADMIN':
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'QUALITE':
          this.router.navigate(['/dashboard/qualite']);
          break;
        case 'DIRECTION':
          this.router.navigate(['/dashboard/direction']);
          break;
        case 'MANAGER':
          this.router.navigate(['/dashboard/manager']);
          break;
      }
    },
    error: (error) => {
      console.error('❌ Erreur de login:', error);
      this.loading = false;

      const msg = error?.error;
      if (msg?.includes('Mot de passe incorrect')) {
        this.errorMessage = '❌ Mot de passe incorrect !';
      } else if (msg?.includes('Email introuvable')) {
        this.errorMessage = '❌ Email introuvable !';
      } else if (msg?.includes('Trop de tentatives échouées')) {
        this.errorMessage = '🚫 Trop de tentatives ! Votre compte est temporairement bloqué.';
      } else if (msg?.includes('attente') || msg?.includes('validation')) {
        this.errorMessage = '⏳ Votre compte est en attente de validation par un administrateur.';
      } else if (msg?.includes('refusé') || msg?.includes('refusée')) {
        this.errorMessage = '🚫 Votre inscription a été refusée.';
      } else if (error.status === 403) {
        this.errorMessage = '🚫 Accès interdit ! Vérifiez vos identifiants.';
      } else {
        this.errorMessage = '❌ Une erreur est survenue. Veuillez réessayer.';
      }
    },
    complete: () => {
      this.loading = false;
    }
  });
}

}
