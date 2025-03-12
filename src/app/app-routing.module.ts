import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './componants/user/user.component';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { TeamComponent } from './componants/team/team.component';
import { DashboardQualiteComponent } from './componants/dashboard-qualite/dashboard-qualite.component';
import { ProjectTaskComponent } from './componants/project-task/project-task.component';
import { ClientComponent } from './componants/client/client.component';
import { ProjectComponent } from './componants/project/project.component';
//import { LoginComponent } from './componants/login/login.component';
//import { RegisterComponent } from './componants/register/register.component';



const routes: Routes = [
   { path: 'TeamMember', component: TeamMemberComponent },
   { path: 'Task', component: ProjectTaskComponent },
   { path: 'Team', component: TeamComponent },
   { path: 'User', component: UserComponent },
   { path: 'Client', component: ClientComponent },
   { path: 'project', component: ProjectComponent },
   { path: 'dashboard', component: DashboardQualiteComponent },
  // { path: 'login', component: LoginComponent }, 
   //{ path: 'register', component: RegisterComponent }, // ✅ Utilisation correcte
   //{ path: '', redirectTo: 'login', pathMatch: 'full' }

  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
