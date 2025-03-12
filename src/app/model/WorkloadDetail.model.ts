import { Devis } from "./devis.model";

export interface WorkloadDetail {
    id?: number;
    period: string;
    estimatedWorkload: number;
    publicHolidays: number;
    actualWorkload: number;
    devis?: Devis;
  }
  