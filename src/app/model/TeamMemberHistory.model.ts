export interface TeamMemberHistory {
  id?: number;
  teamMemberId: number;
  fieldName: string;
  oldValue: string;
  newValue: string;
  modifiedDate: Date;
  modifiedBy?: string;
  teamMember?: any; // Pour la relation avec TeamMember
} 