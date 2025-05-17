export interface WorkEntry {
  id?: number;
  memberId: number;
  taskId: number;
  date: string; // Format YYYY-MM-DD
  status: 'full' | 'half' | 'leave' | 'none';
  comment?: string;
} 