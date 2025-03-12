import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'workpilot-front';
  showNavbar: boolean = true;  // ✅ Variable pour contrôler l'affichage du Navbar

  constructor(private router: Router) {
    // Surveille les changements de route
    this.router.events.subscribe(() => {
      // Vérifie si l'utilisateur est sur /login ou /register
      const currentRoute = this.router.url;
      this.showNavbar = !(currentRoute === '/login' || currentRoute === '/register');
    });
  }
}
