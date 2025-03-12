import { Devis } from "./devis.model";

export interface InvoicingDetail {
    id?: number;
    description: string;
    invoicingDate: Date;
    amount: number;
    status: string;
    devis?: Devis;
  }
  