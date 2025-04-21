export interface PlannedWorkload {
  id?: number;
  month: string;
  year: number;
  estimatedWorkloadPerResource: number;
  numberOfResources: number;
  totalEstimatedWorkload: number;
  projectId: number;
  projectName?: string;
}
