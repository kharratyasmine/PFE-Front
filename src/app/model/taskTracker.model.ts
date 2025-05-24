export interface TaskTracker {
  id?: number;
  psrId?: number;
  projectId?: number;
  description: string;
  week: string;
  who: string;
  startDate: Date;
  estimatedEndDate: Date;
  effectiveEndDate?: Date;
  workedMD: number;
  estimatedMD: number;
  remainingMD: number;
  progress: number;
  currentStatus: string;
  effortVariance: number;
  deviationReason?: string;
  note?: string;
}
