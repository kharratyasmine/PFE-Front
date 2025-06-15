import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  roleTargeted?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private socket$: WebSocketSubject<any> | null = null;
  private readonly WS_ENDPOINT = `${environment.apiUrl.replace('http', 'ws')}/ws`;
  private readonly API_URL = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (this.socket$) {
      this.socket$.complete();
    }
    
    this.socket$ = webSocket(this.WS_ENDPOINT);
    this.socket$.subscribe(
      (notification: Notification) => {
        this.addNotification(notification);
      },
      (err) => {
        console.error('WebSocket error:', err);
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    );
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  addNotification(notification: Notification) {
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);
  }

  markAsRead(notificationId: number) {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    this.notifications.next(updatedNotifications);
    
    // Appel API pour marquer comme lu côté backend
    return this.http.put(`${this.API_URL}/${notificationId}/read`, {});
  }

  clearNotifications() {
    this.notifications.next([]);
  }

  // Méthode pour s'abonner aux notifications spécifiques à un rôle
  subscribeToRoleNotifications(role: string) {
    const destination = role === 'ADMIN' ? '/topic/admin-notifications' : '/topic/notification';
    // Implémentation de la souscription aux notifications spécifiques au rôle
  }
} 