import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardQualiteComponent } from './componants/dashboard-qualite/dashboard-qualite.component';
import { UserComponent } from './componants/user/user.component';
import { TeamMemberComponent } from './componants/team-member/team-member.component';
import { NavbarComponent } from './componants/navbar/navbar.component';
import { TeamComponent } from './componants/team/team.component';
import { ProjectTaskComponent } from './componants/project-task/project-task.component';
import { ClientComponent } from './componants/client/client.component';
import { ProjectComponent } from './componants/project/project.component';
/*import { LoginComponent } from './componants/login/login.component';
import { RegisterComponent } from './componants/register/register.component';*/
import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  declarations: [
    AppComponent,
    DashboardQualiteComponent,
    UserComponent,
    TeamMemberComponent,
    NavbarComponent,
    TeamComponent,
    TeamMemberComponent,
    ProjectTaskComponent,
    ClientComponent,
    ProjectComponent,
    /*LoginComponent,
    RegisterComponent  */ 
    
    
   
   
     ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
