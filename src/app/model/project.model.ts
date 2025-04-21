import { Client } from './client.model';
import { Demande } from './demande.model';
import { Devis } from './devis.model';
import { Team} from './Team.model';
import { User } from './user.model';
// project-task.component.ts
import { ProjectGroup } from 'src/app/model/project-group.model';

export interface Project {
  id?: number;
  name: string;
  projectType: string;
  description: string;
  startDate: string; // Format "yyyy-MM-dd" reçu de l'API
  endDate: string;
  technologie: string;
  activity: string;
  status: Status;
  clientId: null;
  client?: Client;
  userId: null;
  userName: string;
  user?: User;
  teams: Team[]; 
  teamIds?: number[]; 
  demandes: Demande[]; 
  devisList: Devis[];
  
}

export interface ProjectDTO {
  id?: number;
  name: string;
  projectType: string;
  description: string;
  startDate: string;
  endDate: string;
  technologie: string;
  activity: string;
  status: Status;
  clientId: number | null;
  userId: number | null;
  teamIds: number[];
}


export enum Status { 
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
  EN_ATTENTE = "EN_ATTENTE",
  ANNULE = "ANNULE",

}
