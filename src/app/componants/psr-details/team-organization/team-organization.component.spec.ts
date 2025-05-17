import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamOrganizationComponent } from './team-organization.component';

describe('TeamOrganizationComponent', () => {
  let component: TeamOrganizationComponent;
  let fixture: ComponentFixture<TeamOrganizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamOrganizationComponent]
    });
    fixture = TestBed.createComponent(TeamOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
