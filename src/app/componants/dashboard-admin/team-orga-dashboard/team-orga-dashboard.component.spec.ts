import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamOrgaDashboardComponent } from './team-orga-dashboard.component';

describe('TeamOrgaDashboardComponent', () => {
  let component: TeamOrgaDashboardComponent;
  let fixture: ComponentFixture<TeamOrgaDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamOrgaDashboardComponent]
    });
    fixture = TestBed.createComponent(TeamOrgaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
