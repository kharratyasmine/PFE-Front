import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedWorkloadMemberComponent } from './planned-workload-member.component';

describe('PlannedWorkloadMemberComponent', () => {
  let component: PlannedWorkloadMemberComponent;
  let fixture: ComponentFixture<PlannedWorkloadMemberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlannedWorkloadMemberComponent]
    });
    fixture = TestBed.createComponent(PlannedWorkloadMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
