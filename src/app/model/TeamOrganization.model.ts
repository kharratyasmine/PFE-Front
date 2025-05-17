export interface TeamOrganization {
  initial: string;
  fullName: string;
  role: string;
  project: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  allocation: string;
  comingFromTeam: string;
  goingToTeam: string;
  holiday: string;
  email?: string;
  phone?: string;
  department?: string;
  teamName?: string;
}
