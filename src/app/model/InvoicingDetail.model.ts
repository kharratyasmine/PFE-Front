import { Devis } from "./devis.model";

export interface InvoicingDetail {
    id?: number;
    description: string;
    invoicingDate: Date | string;
    actualWorkload?: number; // ✅ Important !
    amount: number;
    status: string;
    devis?: Devis;
  }
  