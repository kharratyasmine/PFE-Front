import { TeamMember } from "./TeamMember.model";

export interface Team {
  id: number;
  name: string;
  members: TeamMember[];
  projectIds: number[];
}
