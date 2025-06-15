import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role === 'ADMIN') {
      return true;
    }

    // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
    this.router.navigate(['/dashboard']);
    return false;
  }
} 