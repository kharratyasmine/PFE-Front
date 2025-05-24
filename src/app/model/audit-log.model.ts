export interface AuditLog {
  id: number;
  username: string;
  action: string;
  entityAffected: string;
  methodName: string;
  timestamp: string;
  parameters: string;
}
