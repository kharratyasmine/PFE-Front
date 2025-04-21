import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

// Composants
import { AppComponent } from './app.component';
import { DashboardQualiteComponent } from './componants/dashboard-qualite/dashboard-qualite.component';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { NavbarComponent } from './componants/navbar/navbar.component';
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
import { PlannedWorkloadComponent } from './componants/planned-workload/planned-workload.component';
import { LoginComponent } from './componants/login/login.component';
import { RegisterComponent } from './componants/register/register.component';
import { TeamMemberDetailsComponent } from './componants/team-member-details/team-member-details.component';

// Modules externes
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

// Traduction
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AuthInterceptor } from './services/auth.interceptor';
import { DevisDetailsComponent } from './componants/devis-details/devis-details.component';
import { SummaryComponent } from './componants/devis-details/summary/summary.component';
import { WorkloadComponent } from './componants/devis-details/workload/workload.component';
import { FinancialComponent } from './componants/devis-details/financial/financial.component';
import { InvoicingComponent } from './componants/devis-details/invoicing/invoicing.component';
import { HistoryComponent } from './componants/devis-details/history/history.component';



// Fonction de chargement i18n
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardQualiteComponent,
    TeamMemberComponent,
    NavbarComponent,
    TeamComponent,
    ProjectTaskComponent,
    ClientComponent,
    ProjectComponent,
    DashboardComponent,
    TeamMemberGridComponent,
    MyProfilComponent,
    ProjectDetailsComponent,
    DevisComponent,
    PlannedWorkloadComponent,
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
  
 
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    NgxPaginationModule,
    // Initialisation d'angular-calendar avec DateAdapter (basé sur date-fns)
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    // Modules Angular Material
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
