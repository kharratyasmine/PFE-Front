import { Distribution, Visa } from "./distribution.model";
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
  author?: string;
  financialDetails?: FinancialDetail[];
  workloadDetails?: WorkloadDetail[];
  invoicingDetails?: InvoicingDetail[];
  distributions?: Distribution[];
  visas?: Visa[];
  history?: DevisHistory[];
  projectId: number;
  demandeId?: number;
}



export interface DevisHistory {

}