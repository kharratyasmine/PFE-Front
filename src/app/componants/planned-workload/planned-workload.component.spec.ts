import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedWorkloadComponent } from './planned-workload.component';

describe('PlannedWorkloadComponent', () => {
  let component: PlannedWorkloadComponent;
  let fixture: ComponentFixture<PlannedWorkloadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlannedWorkloadComponent]
    });
    fixture = TestBed.createComponent(PlannedWorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
