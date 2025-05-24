
export interface WeeklyReport {
  id?: number;
  psrId: number;
  projectName: string;
  week: string;
  workingDays: number;
  estimatedDays: number;
  effortVariance?: number;
}
