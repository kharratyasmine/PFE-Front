import { FinancialDetail } from "./FinancialDetail.model";
import { InvoicingDetail } from "./InvoicingDetail.model";
import { Project } from "./project.model";
import { WorkloadDetail } from "./WorkloadDetail.model";

export interface Devis {
  id?: number;
  reference: string;
  edition: string;
  creationDate: Date;
  totalCost: number;
  status: string;
  proposalValidity: string;
  project?: Project;
  financialDetails?: FinancialDetail[];
  workloadDetails?: WorkloadDetail[];
  invoicingDetails?: InvoicingDetail[];
}
