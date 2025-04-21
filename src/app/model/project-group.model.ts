// src/app/model/project-group.model.ts
import { ProjectTask } from './ProjectTask.model';

export interface ProjectGroup {
  projectId: number | null;
  projectName: string;
  tasks: ProjectTask[];
  filteredTasks: ProjectTask[]; // Tâches filtrées (recherche)
  currentPage: number;
}
