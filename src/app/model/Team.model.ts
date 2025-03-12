import { TeamMember } from './TeamMember.model'; // ✅ Import de TeamMember
import { Project } from './project.model';

export interface Team {
  id: number;
  name: string;
  project?: Project;  // ✅ Autoriser null et undefined
  members: TeamMember[];
}
