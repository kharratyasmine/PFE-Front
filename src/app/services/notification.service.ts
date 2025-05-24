import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient!: Client;
  public notifications$ = new BehaviorSubject<Notification[]>([]);
  private isConnected = false;
  private messageQueue: string[] = [];
  private notificationCounter = 0;

  constructor(private authService: AuthService) {
    this.initializeStompClient();
  }

  private initializeStompClient() {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('❌ No access token available');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = (frame) => {
      console.log('✅ Connected to STOMP:', frame);
      this.isConnected = true;
      
      this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
        console.log('📨 Received notification:', message.body);
        const newNotification: Notification = {
          id: this.notificationCounter++,
          message: message.body,
          timestamp: new Date(),
          read: false
        };
        const currentNotifications = this.notifications$.value;
        this.notifications$.next([newNotification, ...currentNotifications]);
      });

      this.flushMessageQueue();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
      this.isConnected = false;
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      this.isConnected = false;
    };
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  connect(): void {
    if (!this.isConnected) {
      try {
        const token = this.authService.getAccessToken();
        if (!token) {
          console.error('❌ Cannot connect: No access token available');
          return;
        }

        console.log('🔄 Attempting to connect to WebSocket...');
        this.stompClient.activate();
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  }

  disconnect(): void {
    if (this.isConnected) {
      console.log('Disconnecting from WebSocket...');
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  sendMessage(message: string): void {
    console.log('📤 Attempting to send message:', message);
    
    if (this.isConnected) {
      console.log('📤 Sending notification:', message);
      this.stompClient.publish({
        destination: '/app/notifications',
        body: message,
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        }
      });
    } else {
      console.warn('⚠️ WebSocket not connected, queuing message');
      this.messageQueue.push(message);
      this.connect();
    }
  }

  markAsRead(notificationId: number): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    this.notifications$.next(updatedNotifications);
  }

  markAllAsRead(): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notifications$.next(updatedNotifications);
  }

  getUnreadCount(): number {
    return this.notifications$.value.filter(notification => !notification.read).length;
  }

  clearAllNotifications(): void {
    this.notifications$.next([]);
  }
}
