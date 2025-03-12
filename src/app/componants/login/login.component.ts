import { Component } from '@angular/core';
/*import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
*/
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // ✅ Ajout du style CSS
})
export class LoginComponent {
 /* loginForm: FormGroup; // ✅ Ajout du formulaire réactif
  errorMessage: string = ''; // ✅ Variable pour afficher les erreurs

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // ✅ Initialisation du formulaire avec validations
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // ✅ Fonction appelée lors de la soumission du formulaire
  login() {
    if (this.loginForm.invalid) {
      this.errorMessage = '⚠️ Veuillez remplir tous les champs correctement.';
      return;
    }

    this.errorMessage = ''; // ✅ Réinitialiser le message à chaque tentative

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Authentification réussie:', response);
        this.authService.saveToken(response.access_token);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Erreur de login:', error);
        
        if (error.error.includes('Mot de passe incorrect')) {
          this.errorMessage = '❌ Mot de passe incorrect !';
        } else if (error.error.includes('Email introuvable')) {
          this.errorMessage = '❌ Email introuvable !';
        } else if (error.error.includes('Trop de tentatives échouées')) {
          this.errorMessage = '🚫 Trop de tentatives ! Votre compte est temporairement bloqué.';
        } else {
          this.errorMessage = '❌ Login échoué ! Vérifiez vos identifiants.';
        }
      },
    });
  }*/
}
