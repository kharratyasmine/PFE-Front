import { Devis } from "./devis.model";

export interface FinancialDetail {
  id?: number;
  position: string;
  workload: number;
  dailyCost: number;
  totalCost: number;
  devisId?: number;
}
