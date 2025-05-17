import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrPlanningComponent } from './psr-planning.component';

describe('PsrPlanningComponent', () => {
  let component: PsrPlanningComponent;
  let fixture: ComponentFixture<PsrPlanningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsrPlanningComponent]
    });
    fixture = TestBed.createComponent(PsrPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
