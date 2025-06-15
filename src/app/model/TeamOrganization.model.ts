export interface HolidayDetail {
  date: string;
  type: string;
}

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
  holidayDetails?: HolidayDetail[];
  email?: string;
  phone?: string;
  department?: string;
  teamName?: string;
}
