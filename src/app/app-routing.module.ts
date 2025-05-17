import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { TeamComponent } from './componants/team/team.component';
import { ProjectTaskComponent } from './componants/project-task/project-task.component';
import { ClientComponent } from './componants/client/client.component';
import { ProjectComponent } from './componants/project/project.component';
import { DashboardComponent } from './componants/dashboard/dashboard.component';
import { TeamMemberGridComponent } from './componants/team-member-grid/team-member-grid.component';
import { MyProfilComponent } from './componants/my-profil/my-profil.component';
import { ProjectDetailsComponent } from './componants/project-details/project-details.component';
import { DevisComponent } from './componants/devis/devis.component';
import { DemandesComponent } from './componants/demandes/demandes.component';
import { LoginComponent } from './componants/login/login.component';
import { RegisterComponent } from './componants/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { TeamMemberDetailsComponent } from './componants/team-member-details/team-member-details.component';
import { DevisDetailsComponent } from './componants/devis-details/devis-details.component';
import { PlannedWorkloadMemberComponent } from './componants/planned-workload-member/planned-workload-member.component';
import { ExcelImportComponent } from './componants/excel-import/excel-import.component';
import { PsrComponent } from './componants/psr/psr.component';
import { PsrDetailsComponent } from './componants/psr-details/psr-details.component';
import { DeliveriesComponent } from './componants/psr-details/deliveries/deliveries.component';
import { PsrCoverComponent } from './componants/psr-details/psr-cover/psr-cover.component';
import { PsrWeeklyComponent } from './componants/psr-details/psr-weekly/psr-weekly.component';
import { PsrRisksComponent } from './componants/psr-details/psr-risks/psr-risks.component';
import { PsrPlanningComponent } from './componants/psr-details/psr-planning/psr-planning.component';
import { SummaryComponent } from './componants/devis-details/summary/summary.component';
import { HistoryComponent } from './componants/devis-details/history/history.component';
import { FinancialComponent } from './componants/devis-details/financial/financial.component';
import { InvoicingComponent } from './componants/devis-details/invoicing/invoicing.component';
import { WorkloadComponent } from './componants/devis-details/workload/workload.component';
import { TeamOrganizationComponent } from './componants/psr-details/team-organization/team-organization.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent }, // ✅ Remis ici
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'TeamMember', component: TeamMemberComponent, canActivate: [AuthGuard] },
  { path: 'TeamMemberGrid', component: TeamMemberGridComponent, canActivate: [AuthGuard] },
  { path: 'Client', component: ClientComponent, canActivate: [AuthGuard] },
  { path: 'teamMemberDetails', component: TeamMemberDetailsComponent, canActivate: [AuthGuard] },
  { path: 'project', component: ProjectComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: MyProfilComponent, canActivate: [AuthGuard] },
  { path: 'psr', component: PsrComponent, canActivate: [AuthGuard] },
  { path: 'excel', component: ExcelImportComponent },

  {
    path: 'project/:id', component: ProjectDetailsComponent, children: [
      { path: 'demandes', component: DemandesComponent },
      { path: 'team', component: TeamComponent },
      { path: 'plannedWorkloadMember', component: PlannedWorkloadMemberComponent },
      { path: 'Task', component: ProjectTaskComponent },
      { path: 'devis', component: DevisComponent },
      { path: 'psr', component: PsrComponent },
      { path: '', redirectTo: 'demandes', pathMatch: 'full' }
    ]
  },
  {
    path: 'psrDetails/:psrId', component: PsrDetailsComponent,
    children: [
      { path: '', redirectTo: 'teamOrganization', pathMatch: 'full' },
      { path: 'coverPage', component: PsrCoverComponent },
       { path:'teamOrganization', component: TeamOrganizationComponent },
      { path: 'weekly', component: PsrWeeklyComponent },
      { path: 'risks', component: PsrRisksComponent },
      { path: 'deliveries', component: DeliveriesComponent },
      { path: 'planning', component: PsrPlanningComponent }
    ]
  },
  {
    path: 'devisDetails/:devisId', component: DevisDetailsComponent,
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', component: SummaryComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'financial', component: FinancialComponent },
      { path: 'invoicing', component: InvoicingComponent },
      { path: 'workload', component: WorkloadComponent }

    ]
  },

  { path:'project/:projectId/psr/:psrId', component: PsrDetailsComponent },
  { path:'project/:projectId/devis/:devisId', component: DevisDetailsComponent },
  { path: 'devisDetails/:devisId', component: DevisDetailsComponent },
  { path: 'psrDetails/:psrId', component: PsrDetailsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
