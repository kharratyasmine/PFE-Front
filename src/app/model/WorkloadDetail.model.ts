import { Devis } from "./devis.model";

export interface WorkloadDetail {
    id?: number;
    period: string;
    estimatedWorkload: number;
    publicHolidays: number;
    publicHolidayDates?: string[];
    numberOfResources: number
    totalEstimatedWorkload: number;
    note :string;
    devisId?: Devis;
  }
  