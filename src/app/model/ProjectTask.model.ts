// ProjectTask.model.ts
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export interface TaskAssignment {
  id?: number;
  teamMemberId: number |null;
  teamMemberName?: string;
  progress: number;
  workedMD: number;
  estimatedMD: number;
  remainingMD?: number;
  estimatedStartDate: string;
  estimatedEndDate: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
}

export interface ProjectTask {
  id?: number;
  name: string;
  description: string;
  dateDebut: string; // YYYY-MM-DD
  dateFin: string;
  status: TaskStatus;
  progress: number;
  projectId: number | null;
  projectName?: string;
  assignments: TaskAssignment[];
}
