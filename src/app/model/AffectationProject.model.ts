import { Project } from "./project.model";
import { Team } from "./Team.model";
import { TeamMember } from "./TeamMember.model";

export interface AffectationProject {
    id?: number;
    charge: number;
    dateDebut: string;
    dateFin: string;
    coutTotal: number;
    teamMember?: TeamMember;
    project?: Project;
    team?: Team;
  }
  