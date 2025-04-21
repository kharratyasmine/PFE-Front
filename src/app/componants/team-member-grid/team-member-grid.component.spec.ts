import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMemberGridComponent } from './team-member-grid.component';

describe('TeamMemberGridComponent', () => {
  let component: TeamMemberGridComponent;
  let fixture: ComponentFixture<TeamMemberGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamMemberGridComponent]
    });
    fixture = TestBed.createComponent(TeamMemberGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
