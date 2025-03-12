import { AffectationProject } from "./AffectationProject.model";
import { ProjectTask } from "./ProjectTask.model";
import { Seniorite } from "./seniorite.enum";
import { Team } from "./Team.model";

export interface TeamMember {
  id?: number;
  image: string;
  name: string;
  initial: string;
  allocation: number;
  holiday: string;
  dateEmbauche: string;
  seniorite: Seniorite;
  cout: number;
  affectations?: AffectationProject[];
  tasks?: ProjectTask[];
  team: Team | null; // Lien avec l'équipe
  note?: string;
  teamRole?: string;
}

