import { Risk } from './risk.model';
import { Deliveries } from './deliveries.model';

export interface Psr {
  id?: number;
  reportTitle?: string;
  reportDate: Date | string;
  comments?: string;
  overallStatus: string;
  reference?: string;
  edition?: string;
  date?: Date | string;
  preparedBy?: string;
  approvedBy?: string;
  validatedBy?: string;
  approvedByDate : Date | string;
  preparedByDate : Date | string;
  validatedByDate : Date | string;
  status?: string;
  projectName?: string;
  clientName?: string;
  week?: string;
  authorName?: string;
  projectId: number;
  devisId?: number;
  risks?: any[];
  deliveries?: any[];
  actions?: { type: string, name: string, date: string }[];
}


