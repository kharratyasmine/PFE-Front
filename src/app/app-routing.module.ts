import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { TeamComponent } from './componants/team/team.component';
import { DashboardQualiteComponent } from './componants/dashboard-qualite/dashboard-qualite.component';
import { ProjectTaskComponent } from './componants/project-task/project-task.component';
import { ClientComponent } from './componants/client/client.component';
import { ProjectComponent } from './componants/project/project.component';
import { DashboardComponent } from './componants/dashboard/dashboard.component';
import { TeamMemberGridComponent } from './componants/team-member-grid/team-member-grid.component';
import { MyProfilComponent } from './componants/my-profil/my-profil.component';
import { ProjectDetailsComponent } from './componants/project-details/project-details.component';
import { DevisComponent } from './componants/devis/devis.component';
import { DemandesComponent } from './componants/demandes/demandes.component';
import { PlannedWorkloadComponent } from './componants/planned-workload/planned-workload.component';
import { LoginComponent } from './componants/login/login.component';
import { RegisterComponent } from './componants/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { TeamMemberDetailsComponent } from './componants/team-member-details/team-member-details.component';
import { DevisDetailsComponent } from './componants/devis-details/devis-details.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent }, // ✅ Remis ici
  { path: 'register', component: RegisterComponent },
  { path: 'Dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'TeamMember', component: TeamMemberComponent, canActivate: [AuthGuard] },
  { path: 'TeamMemberGrid', component: TeamMemberGridComponent, canActivate: [AuthGuard] },  
  { path: 'Client', component: ClientComponent, canActivate: [AuthGuard] },
  {path:  'teamMemberDetails', component: TeamMemberDetailsComponent, canActivate: [AuthGuard] },
  { path: 'project', component: ProjectComponent, canActivate: [AuthGuard] },
  { path: 'TeamMember', component: TeamMemberComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: MyProfilComponent , canActivate: [AuthGuard]},

  { path: 'project/:id', component: ProjectDetailsComponent, children: [
    { path: 'demandes', component: DemandesComponent },
    { path: 'team', component: TeamComponent },
    { path: 'Task', component: ProjectTaskComponent },
    { path: 'plannedWorkload', component: PlannedWorkloadComponent },
    { path: 'devis', component: DevisComponent },
    { path: '', redirectTo: 'demandes', pathMatch: 'full' }
]},
{ path: 'devisDetails/:devisId', component: DevisDetailsComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ✅ Page d’accueil = login
  { path: '**', redirectTo: 'login' } // ✅ Pour toutes routes inconnues
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
