/* export interface AuthResponse {
    access_token: string; // ✅ Maintenant, cela correspond à la réponse du backend
    refresh_token: string;
  }
  
  
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { jwtDecode } from 'jwt-decode';
  
  @Injectable({
    providedIn: 'root',
  })
  export class AuthService {
    private apiUrl = 'http://localhost:8888/api/v1/auth';
  
    constructor(private http: HttpClient) {}
  
    register(userData: { firstname: string; lastname: string; email: string; password: string; role: string }) {
      return this.http.post(`${this.apiUrl}/register`, userData);
    }
    login(credentials: { email: string; password: string }): Observable<AuthResponse> {
      return this.http.post<AuthResponse>(
        `${this.apiUrl}/authenticate`,
        credentials,
        { headers: { 'Content-Type': 'application/json' } } // ✅ Ajoute ce header
      ).pipe(
        tap(response => {
          console.log('📌 Réponse API après login:', response);
          if (response.access_token) {
            this.saveToken(response.access_token);
          }
        })
      );
    }
    
    
    saveToken(token: string): void {
      localStorage.setItem('access_token', token);
    }
    getAccessToken(): string | null {
      const token = localStorage.getItem('access_token');
      console.log('📌 Token récupéré depuis localStorage:', token); // ✅ Vérifier si le token est bien récupéré
      return token ? token : null;
    }
    
    
  
    getUserRole(): string {
      const token = this.getAccessToken();
      if (!token) {
        console.warn('⚠️ Aucun token trouvé, utilisateur considéré comme GUEST.');
        return 'GUEST';
      }
      try {
        console.log('📌 Token récupéré:', token); // ✅ Vérifier si le token est récupéré
        const decoded: any = jwtDecode(token);
        console.log('📌 Token décodé:', decoded); // ✅ Vérifier si le rôle est bien présent
        return decoded.role || 'GUEST'; // 🔥 Retourner le rôle
      } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error);
        return 'GUEST';
      }
    }
    
  
    isAuthenticated(): boolean {
      return !!this.getAccessToken();
    }
  }
  */