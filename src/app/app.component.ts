import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WebSocketService } from './services/WebSocket.service';
import { SearchService } from './services/search.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AppNotification } from 'src/app/model/appNotification.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'workpilot-front';
  showNavbar: boolean = true;
  searchTerm: string = '';
  userName: string = '';
  userImage: string = '';
  currentLang: string = 'en';
  notifications: AppNotification[] = [];
  notificationCount: number = 0;
  hasNotifications: boolean = false;
  isSidebarCollapsed: boolean = false;
  hoverBtn: boolean = false;
  isDashboardMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private translate: TranslateService,
    public authService: AuthService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService
  ) {
    this.translate.setDefaultLang(this.currentLang);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentRoute = event.urlAfterRedirects;
      this.showNavbar = !(currentRoute === '/login' || currentRoute === '/register');
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    if (user && this.authService.isAuthenticated()) {
      this.userName = `${user.firstname} ${user.lastname}`;
      this.userImage = user.photoUrl;


      // Redirection unique pour ADMIN
    //  this.router.navigate(['/dashboard']);

    }

    // Langue
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.changeLanguage(savedLang);
    }
  }



  private initializeWebSocket() {
    // S'assurer que l'utilisateur est connecté avant d'initialiser WebSocket
    if (this.authService.isAuthenticated()) {
      console.log('🔌 Initializing WebSocket connection...');
      this.webSocketService.connect();

      // S'abonner aux notifications
      this.webSocketService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.notificationCount = this.webSocketService.getUnreadCount();
        this.hasNotifications = this.notificationCount > 0;

        // Afficher une notification toast pour les nouvelles notifications
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          this.toastr.info(unreadNotifications[0].message, '🔔 Nouvelle notification');
        }
      });
    }
  }

  markAsRead(notificationId: number): void {
    this.webSocketService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.webSocketService.markAllAsRead();
  }

  clearAllNotifications(): void {
    this.webSocketService.clearAllNotifications();
  }

  getNotificationTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;

    const days = Math.floor(hours / 24);
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  ngOnDestroy() {
    // Déconnecter proprement lors de la destruction du composant
    this.webSocketService.disconnect();
  }

 getDashboardRoute(): string {
  return '/dashboard';
}


  // Dans votre composant
  activeDropdown: string | null = null;

  toggleDropdown(menu: string): void {
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }

  isMenuActive(menuRoutes: string[]): boolean {
    return menuRoutes.some(route => this.isActive(route));
  }

  isAuthRoute(): boolean {
    const authRoutes = ['/login', '/register'];
    return authRoutes.some(route => this.router.url.startsWith(route));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const pageWrapper = document.querySelector('.page-wrapper');
    if (this.isSidebarCollapsed) {
      pageWrapper?.classList.add('with-collapsed-sidebar');
    } else {
      pageWrapper?.classList.remove('with-collapsed-sidebar');
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

  toggleDashboardMenu() {
    this.isDashboardMenuOpen = !this.isDashboardMenuOpen;
  }
}
