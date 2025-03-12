/*import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // Ajout du style CSS
})
export class RegisterComponent {
  registerForm: FormGroup; // ✅ Utilisation d'un formulaire réactif

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // ✅ Initialisation du formulaire avec validations
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['USER', Validators.required], // Par défaut "USER"
    }, { validators: this.passwordsMatchValidator });
  }

  // ✅ Correcteur de validation pour comparer password et confirmPassword
  passwordsMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  // ✅ Fonction appelée lors de la soumission du formulaire
  register() {
    if (this.registerForm.invalid) {
      alert("Veuillez remplir correctement tous les champs !");
      return;
    }
  
    const user = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role, // Par défaut : USER
    };
  
    this.authService.register(user).subscribe({
      next: () => {
        alert("Inscription réussie ! Redirection vers la page de connexion...");
        this.router.navigate(['/login']);  // ✅ Redirection automatique
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'inscription:", err);
        alert("Échec de l'inscription. Essayez un autre email.");
      },
    });
  }
  
}*/
