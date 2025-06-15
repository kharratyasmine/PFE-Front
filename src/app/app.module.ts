import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgChartsModule } from 'ng2-charts';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Composants
import { AppComponent } from './app.component';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { NavbarComponent } from './componants/navbar/navbar.component';
import { TeamComponent } from './componants/team/team.component';
import { ProjectTaskComponent } from './componants/project-task/project-task.component';
import { ClientComponent } from './componants/client/client.component';
import { ProjectComponent } from './componants/project/project.component';
import { TeamMemberGridComponent } from './componants/team-member-grid/team-member-grid.component';
import { MyProfilComponent } from './componants/my-profil/my-profil.component';
import { ProjectDetailsComponent } from './componants/project-details/project-details.component';
import { DevisComponent } from './componants/devis/devis.component';
import { DemandesComponent } from './componants/demandes/demandes.component';
import { LoginComponent } from './componants/login/login.component';
import { RegisterComponent } from './componants/register/register.component';
import { TeamMemberDetailsComponent } from './componants/team-member-details/team-member-details.component';
import { DevisDetailsComponent } from './componants/devis-details/devis-details.component';
import { SummaryComponent } from './componants/devis-details/summary/summary.component';
import { WorkloadComponent } from './componants/devis-details/workload/workload.component';
import { FinancialComponent } from './componants/devis-details/financial/financial.component';
import { InvoicingComponent } from './componants/devis-details/invoicing/invoicing.component';
import { HistoryComponent } from './componants/devis-details/history/history.component';
import { PlannedWorkloadMemberComponent } from './componants/planned-workload-member/planned-workload-member.component';
import { ExcelImportComponent } from './componants/excel-import/excel-import.component';
import { PsrComponent } from './componants/psr/psr.component';
import { PsrDetailsComponent } from './componants/psr-details/psr-details.component';
import { DeliveriesComponent } from './componants/psr-details/deliveries/deliveries.component';
import { PsrCoverComponent } from './componants/psr-details/psr-cover/psr-cover.component';
import { PsrWeeklyComponent } from './componants/psr-details/psr-weekly/psr-weekly.component';
import { PsrRisksComponent } from './componants/psr-details/psr-risks/psr-risks.component';
import { PsrPlanningComponent } from './componants/psr-details/psr-planning/psr-planning.component';
import { TeamOrganizationComponent } from './componants/psr-details/team-organization/team-organization.component';
import { AuditLogComponent } from './componants/audit-log/audit-log.component';
import { ValidateUserComponent } from './componants/validate-user/validate-user.component';
import { TaskTrakerComponent } from './componants/psr-details/task-traker/task-traker.component';
import { DashboardAdminComponent } from './componants/dashboard-admin/dashboard-admin.component';
import { TasksTimeShestsComponent } from './componants/dashboard-admin/tasks-time-shests/tasks-time-shests.component';
import { PlannedWorkloadComponent } from './componants/dashboard-admin/planned-workload/planned-workload.component';
import { PsrHistoryComponent } from './componants/psr-history/psr-history.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Modules externes
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

// Traduction
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AuthInterceptor } from './services/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { ProjectSelectionService } from './services/DashboardSelection.service';
import { TeamOrgaDashboardComponent } from './componants/dashboard-admin/team-orga-dashboard/team-orga-dashboard.component';

export function loadEcharts() {
  return import('echarts');
}
// Fonction de chargement i18n
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
   TeamMemberComponent,
    NavbarComponent,
    TeamComponent,
    ProjectTaskComponent,
    ClientComponent,
    ProjectComponent,
    TeamMemberGridComponent,
    MyProfilComponent,
    ProjectDetailsComponent,
    DevisComponent,
    DemandesComponent,
    LoginComponent,
    RegisterComponent,
    TeamMemberDetailsComponent,
    DevisDetailsComponent,
    SummaryComponent,
    WorkloadComponent,
    FinancialComponent,
    InvoicingComponent,
    HistoryComponent,
    PlannedWorkloadMemberComponent,
    ExcelImportComponent,
    PsrComponent,
    PsrDetailsComponent,
    DeliveriesComponent,
    PsrCoverComponent,
    PsrWeeklyComponent,
    PsrRisksComponent,
    PsrPlanningComponent,
    TeamOrganizationComponent,
    AuditLogComponent,
    ValidateUserComponent,
    TaskTrakerComponent,
    DashboardAdminComponent,
    TasksTimeShestsComponent,
    PlannedWorkloadComponent,
    TeamOrgaDashboardComponent,
    PsrHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule,
    // Material Modules
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatListModule,
    MatExpansionModule,
    
    // Third Party Modules
    NgxDropzoneModule,
    NgxMatSelectSearchModule,
    NgxPaginationModule,
    NgxEchartsModule.forRoot({
      echarts: loadEcharts
    }),
    NgChartsModule,
    
    // Calendar
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    
    // Toastr
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    
    // Translation
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ProjectSelectionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
