import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

import { SearchService } from './services/search.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'workpilot-front';
  showNavbar: boolean = true;
  searchTerm: string = '';
  userName: string = '';
  userImage: string = '';
  currentLang: string = 'en';

  constructor(
    private router: Router,
    private searchService: SearchService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.translate.setDefaultLang(this.currentLang);

    // Utilisation d'un type guard dans le filtre pour ne garder que NavigationEnd.
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentRoute = event.urlAfterRedirects;
      // Masquer la navbar sur les routes /login et /register
      this.showNavbar = !(currentRoute === '/login' || currentRoute === '/register');
    });
  }

  ngOnInit() {
    const user = this.authService.getUserInfo();
    if (user) {
      this.userName = `${user.firstname} ${user.lastname}`;
      this.userImage = user.photoUrl;
    }
    // Optionnel : charger la langue depuis localStorage
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.changeLanguage(savedLang);
    }
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  onSearch(): void {
    const query = this.searchTerm?.trim();
    if (!query) return;

    const currentRoute = this.router.url;
    if (currentRoute.startsWith('/project')) {
      this.searchService.emitSearch(query);
    } else {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  isAuthRoute(): boolean {
    const authRoutes = ['/login', '/register'];
    return authRoutes.some(route => this.router.url.startsWith(route));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isSidebarCollapsed = false;
  hoverBtn: boolean = false;
  // méthode appelée au clic sur le burger
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    console.log('Sidebar toggled, new state:', this.isSidebarCollapsed);
  
    // Appliquer ou retirer la classe pour ajuster la largeur du contenu principal
    const pageWrapper = document.querySelector('.page-wrapper');
    if (this.isSidebarCollapsed) {
      pageWrapper?.classList.add('with-collapsed-sidebar');
    } else {
      pageWrapper?.classList.remove('with-collapsed-sidebar');
    }
  }
  

}
