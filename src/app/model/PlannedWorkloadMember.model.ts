export interface PlannedWorkloadMember {
    id?: number;
    month: string;
    year: number;
    workload: number;
    note: string;
    teamMemberId: number;
    teamMemberName?: string;
    teamMemberRole?: string;
    projectId: number;
  }
  