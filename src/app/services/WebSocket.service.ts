import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, from } from 'rxjs';
import { retryWhen, delay, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AppNotification } from 'src/app/model/appNotification.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private messageSubject = new Subject<string>();
  private unreadCount = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000;
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Public observables
  public connectionStatus$ = this.connectionStatus.asObservable();
  public currentMessage$ = this.messageSubject.asObservable();


  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.loadPersistedNotifications();
  }

  public connect(): Observable<void> {
    return new Observable(observer => {
      if (this.stompClient && this.stompClient.connected) {
        console.log('WebSocket already connected');
        observer.next();
        observer.complete();
        return;
      }

      this.initializeWebSocket();
      observer.next();
      observer.complete();
    });
  }

private initializeWebSocket() {
    console.log('Initializing WebSocket connection...');
    const socket = new SockJS(`${environment.apiUrl}/ws`);
    
    this.stompClient = Stomp.Stomp.over(socket);
    this.stompClient.debug = (str: string) => {
        console.log('STOMP Debug:', str);
    };

    const token = this.authService.getAccessToken();
    const headers = { 
        Authorization: `Bearer ${token}` 
    };

    this.stompClient.connect(headers, 
        () => {
            console.log('✅ Successfully connected to WebSocket');
            this.connectionStatus.next(true);
            this.subscribeToNotifications();
            
            if (this.authService.getCurrentUserRole() === 'ADMIN') {
                this.subscribeToAdminNotifications();
            }
        },
        (error: any) => {
            console.error('❌ WebSocket connection error:', error);
            this.connectionStatus.next(false);
            this.retryConnection();
        }
    );
}


  private retryConnection() {
    const token = this.authService.getAccessToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    from(this.stompClient.connect(headers))
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            delay(this.reconnectDelay),
            take(this.maxReconnectAttempts),
            tap(() => console.log('🔄 Attempting to reconnect...'))
          )
        )
      )
      .subscribe({
        next: () => {
          console.log('✅ Reconnected to WebSocket');
          this.connectionStatus.next(true);
          this.subscribeToNotifications();
          if (this.authService.getCurrentUserRole() === 'ADMIN') {
            this.subscribeToAdminNotifications();
          }
        },
        error: (error) => {
          console.error('❌ Max reconnection attempts reached:', error);
          this.connectionStatus.next(false);
        }
      });
  }

private subscribeToNotifications() {
    if (!this.stompClient || !this.stompClient.connected) {
        console.warn('WebSocket not connected');
        return;
    }

    console.log('Subscribing to /topic/notification');
    this.stompClient.subscribe('/topic/notification', 
        (message: { body: string }) => {
            console.log('Raw message:', message);
            console.log('Message body:', message.body);
            try {
                const notification = JSON.parse(message.body);
                console.log('Parsed notification:', notification);
                this.addNotification(notification);
            } catch (e) {
                console.error('Error parsing notification:', e);
            }
        },
        (error: any) => {
            console.error('Subscription error:', error);
        }
    );
}

private subscribeToAdminNotifications() {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('⚠️ Cannot subscribe to admin notifications: WebSocket not connected');
      return;
    }

    console.log('🟢 Subscribing to /topic/admin-notifications...');

    this.stompClient.subscribe('/topic/admin-notifications', (message: { body: string }) => {
      console.log('📩 [ADMIN NOTIF] Raw message body:', message.body);

      try {
        const notification: AppNotification = JSON.parse(message.body);
        console.log('✅ [ADMIN NOTIF] Parsed notification:', notification);

        // Ajouter la notification
        this.addNotification(notification);

        // Update message subject
        this.messageSubject.next(message.body);
      } catch (error) {
        console.error('❌ [ADMIN NOTIF] Error parsing message:', error);
      }
    }, (error: any) => {
      console.error('❌ [ADMIN NOTIF] Subscription error:', error);
    });
}



  private addNotification(notification: AppNotification) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.unreadCount++;
    console.log('✅ Notification added:', notification);
  }

  private loadPersistedNotifications() {
    this.http.get<AppNotification[]>(`${environment.apiUrl}/api/notifications`)
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);
          this.unreadCount = notifications.filter(n => !n.read).length;
          console.log('📋 Loaded persisted notifications:', notifications);
        },
        error: (error) => {
          console.error('❌ Error loading persisted notifications:', error);
        }
      });
  }

  public markAsRead(notificationId: number): void {
    this.http.post(`${environment.apiUrl}/api/notifications/${notificationId}/read`, {})
      .subscribe({
        next: () => {
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            if (notification.id === notificationId && !notification.read) {
              this.unreadCount--;
              return { ...notification, read: true };
            }
            return notification;
          });
          this.notificationsSubject.next(updatedNotifications);
          console.log('✅ Notification marked as read:', notificationId);
        },
        error: (error) => {
          console.error('❌ Error marking notification as read:', error);
        }
      });
  }

  public markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const unreadNotifications = currentNotifications.filter(n => !n.read);
    unreadNotifications.forEach(notification => {
      this.http.post(`${environment.apiUrl}/api/notifications/${notification.id}/read`, {})
        .subscribe({
          next: () => {
            console.log('✅ Notification marked as read:', notification.id);
          },
          error: (error) => {
            console.error('❌ Error marking notification as read:', error);
          }
        });
    });
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notificationsSubject.next(updatedNotifications);
    this.unreadCount = 0;
  }

  public clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCount = 0;
  }

  public getUnreadCount(): number {
    return this.unreadCount;
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
      this.connectionStatus.next(false);
    }
  }

  
}
