import { AffectationProject } from './AffectationProject.model';
import { Client } from './client.model';
import { Devis } from './devis.model';
import { ProjectTask } from './ProjectTask.model';
import { Team } from './Team.model';
import { User } from './user.model';

export interface Project {
  id?: number;
  name: string;
  projectType: string;
  description: string;
  startDate: string | Date;  // ✅ Accepter les deux formats
  endDate: string | Date; 
  scope: string;
  requirements: string;
  status: Status;
  devisList?: Devis[]; // Liste des devis liés au projet
  user: User| null; // Chef de projet
  client: Client | null; // Client associé au projet
  affectations?: AffectationProject[]; // TeamMember affectées
  team?: Team[];
  tasks?: ProjectTask[];
}


export enum Status { 
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
  EN_ATTENTE = "EN_ATTENTE",
  ANNULE = "ANNULE",
  EN_ATTENTE_DEVIS = "EN_ATTENTE_DEVIS",
  EN_ATTENTE_VALIDATION = "EN_ATTENTE_VALIDATION",
  EN_ATTENTE_VALIDATION_DEVIS = "EN_ATTENTE_VALIDATION_DEVIS",
  EN_ATTENTE_VALIDATION_AFFECTATION = "EN_ATTENTE_VALIDATION_AFFECTATION"
}


