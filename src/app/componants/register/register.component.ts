import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { WebSocketService} from 'src/app/services/WebSocket.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  successMessage: string = '';
  errorMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private WebSocketService: WebSocketService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['ADMIN', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { mismatch: true }
      : null;
  }

  register() {
    if (this.registerForm.invalid) return;

    this.loading = true;

    const user = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        if (response.access_token) {
          this.authService.saveToken(response.access_token, response.refresh_token!);
         // Suppression de la redirection automatique après inscription avec token
         this.router.navigate(['/login']);
        } else if (response.message) {
          this.successMessage = response.message;
          this.registerForm.reset();
        }

      },
      error: (err) => {
        console.error("❌ Erreur:", err);
        this.errorMessage = "⚠️ Email déjà utilisé ou erreur serveur.";
      },
      complete: () => this.loading = false
    });
  }

}
