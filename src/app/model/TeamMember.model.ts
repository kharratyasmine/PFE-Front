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
  team: number[];
  allocation?: number;
  allocationId?: number; // pour la mise à jour !
   
}
