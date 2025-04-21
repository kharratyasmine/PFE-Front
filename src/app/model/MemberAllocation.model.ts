export interface TeamAllocation {
  teamId: number;
  teamName: string;
  members: TeamMemberAllocation[];
}

export interface TeamMemberAllocation {
  memberId: number;
  firstname: string;
  lastname: string;
  allocationPercentage: number;
}
