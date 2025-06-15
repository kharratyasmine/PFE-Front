import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  activeProjects: number;
  userGrowth: number;
  revenueGrowth: number;
  projectGrowth: number;
}

export interface UserActivity {
  user: string;
  action: string;
  date: Date;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/dashboard`;
  private statsSubject = new BehaviorSubject<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeProjects: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    projectGrowth: 0
  });

  constructor(private http: HttpClient) {
    this.initializeRealTimeUpdates();
  }

  // Récupérer les statistiques
 // getStats(): Observable<DashboardStats> {
 //   return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
 //     map(stats => {
 //       this.statsSubject.next(stats);
 //       return stats;
 //     })
 //   );
//  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/activities`);
  }

  // Récupérer les données pour le graphique d'activité utilisateur
  getUserActivityData(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/user-activity`);
  }

  // Récupérer les données pour le graphique de revenus
  getRevenueData(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/revenue`);
  }

  // Mise à jour en temps réel des statistiques
  private initializeRealTimeUpdates() {
    // Simuler des mises à jour en temps réel (à remplacer par WebSocket dans un environnement réel)
    setInterval(() => {
   //   this.getStats().subscribe();
    }, 30000); // Mise à jour toutes les 30 secondes
  }

  // Observer pour les mises à jour en temps réel
  getStatsUpdates(): Observable<DashboardStats> {
    return this.statsSubject.asObservable();
  }

  exportDashboard(projectId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${projectId}`, {
      responseType: 'blob'
    });
  }

  exportToExcel(projectId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel/${projectId}`, {
      responseType: 'blob'
    });
  }
}
