
export interface WeeklyReport {
  projectName: string;
  workingDays: number;  // Jours travaillés (MD)
  estimatedDays: number; // Jours estimés (MD)
  effortVariance: number; // Variance de l'effort
}

export interface EffortVariance {
  week: string;
  variance: number;  // Effort variance pour la semaine
}

export interface MonthlyEffort {
  month: string;
  variance: number; // Effort variance mensuelle consolidée
}
