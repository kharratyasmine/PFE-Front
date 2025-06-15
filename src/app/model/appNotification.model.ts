export interface AppNotification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  roleTargeted?: string;
}
