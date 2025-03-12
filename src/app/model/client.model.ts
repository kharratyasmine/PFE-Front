import { Project } from './project.model';

export interface Client {
  id: number;
  name: string;
  contact: string;
  address: string;
  email: string;
  projects?: Project[]; 
}
