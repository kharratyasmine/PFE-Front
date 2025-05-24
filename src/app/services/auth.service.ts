import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
   message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth'; // ✅ port de ton backend Spring Boot

  constructor(private http: HttpClient) {}

  // ✅ Register
  register(userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  // ✅ Login
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/authenticate`,
      credentials,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    ).pipe(
      tap((response) => {
        console.log('📌 Réponse API après login:', response);
        if (response.access_token) {
          this.saveToken(response.access_token, response.refresh_token);
        }
      })
    );
  }

  // ✅ Enregistrement des tokens
  saveToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  
    try {
      const decoded: any = jwtDecode(accessToken);
      const user = {
        email: decoded?.sub || '',
        role: decoded?.role || decoded?.authorities?.[0] || 'GUEST',
        firstname: decoded?.firstname || '', // ajoute ça si présent dans le token
        lastname: decoded?.lastname || '',   // idem
        fullName: decoded?.firstname + ' ' + decoded?.lastname,
        imageUrl: decoded?.imageUrl || 'assets/img/profiles/default-avatar.jpg' // fallback
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      console.error("Erreur lors du décodage et de l'enregistrement de l'utilisateur", err);
    }
  }
  
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  getUserInfo(): { firstname: string, lastname: string, photoUrl: string } | null {
    const token = this.getAccessToken();
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      return {
        firstname: decoded?.firstname || '',
        lastname: decoded?.lastname || '',
        photoUrl: decoded?.photoUrl || 'assets/img/profiles/default-avatar.jpg'
      };
    } catch (error) {
      console.error('Erreur décodage JWT', error);
      return null;
    }
  }
  

  // ✅ Suppression des tokens (déconnexion)
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // ✅ Récupérer access_token
  getAccessToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('📌 Token récupéré depuis localStorage:', token);
    return token ?? null;
  }

  // ✅ Récupérer refresh_token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') ?? null;
  }

  // ✅ Décoder le rôle utilisateur
  getUserRole(): string {
    const token = this.getAccessToken();
    if (!token) return 'GUEST';

    try {
      const decoded: any = jwtDecode(token);
      console.log('📌 Décodage JWT:', decoded);
      return decoded?.role || decoded?.authorities?.[0] || 'GUEST';
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
      return 'GUEST';
    }
  }

  // ✅ Décoder l'email (souvent dans "sub")
  getUserEmail(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.sub || decoded?.email || null;
    } catch (error) {
      return null;
    }
  }

  // ✅ Vérifie si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUserRole(): string {
  const user = JSON.parse(localStorage.getItem('currentUser')!);
  return user?.role || '';
}

}