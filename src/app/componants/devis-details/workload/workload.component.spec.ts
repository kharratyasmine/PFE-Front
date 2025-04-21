import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkloadComponent } from './workload.component';

describe('WorkloadComponent', () => {
  let component: WorkloadComponent;
  let fixture: ComponentFixture<WorkloadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkloadComponent]
    });
    fixture = TestBed.createComponent(WorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
