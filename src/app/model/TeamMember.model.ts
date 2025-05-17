import { WorkEntry } from "./work-entry.model";

export interface TeamMember {
  id:number | null;
  name: string;
  initial: string;
  jobTitle: string;
  holiday: string[];
  image: string;
  note: string;
  role: string;
  cost?: number;
  startDate?: string;
  experienceRange?: string;
  teams: number[];
  allocation?: number;
  allocationId?: number; // pour la mise à jour !
  allocationByTeamId?: {
    [teamId: string]: {
      value: number;
      id: number | null;
    };
  };
   workEntries?: WorkEntry[]; // ✅ ajoute cette ligne
   
}
