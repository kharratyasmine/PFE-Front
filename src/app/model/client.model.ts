import { Demande } from './demande.model';
import { Project } from './project.model';

export interface Client {
  id?: number;
  company: string;
  salesManagers: string[];
  contact: string;
  address: string;
  email: string;
  projects?: Project[];
  demandes?: Demande[];
}
