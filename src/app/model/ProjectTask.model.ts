import { Project } from "./project.model";
import { TeamMember } from "./TeamMember.model";

export interface ProjectTask {
    id: number;
    name: string;
    description: string;
    status: TaskStatus;
    startDate: Date;  
    endDate: Date ;  
    progress: number;
    teamMember: TeamMember | null;  // ✅ Allows null if unassigned
    project: Project | null;        // ✅ Allows null if unassigned
}

export enum TaskStatus { 
    EN_COURS = "EN_COURS",
    TERMINE = "TERMINE",
    EN_ATTENTE = "EN_ATTENTE",
    ANNULE = "ANNULE",

  }