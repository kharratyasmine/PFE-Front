// --- 1. weekly-report.model.ts ---
export interface WeeklyReport {
  id: number;
  month: string;
  weekNumber: number;
  year: number;
  projectName: string;
  workingDays: number;
  estimatedDays: number;
  effortVariance: number;
  psrId: number;
  week: string;
  
}