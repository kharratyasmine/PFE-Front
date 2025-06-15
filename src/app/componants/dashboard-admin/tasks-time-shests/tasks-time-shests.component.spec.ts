import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksTimeShestsComponent } from './tasks-time-shests.component';

describe('TasksTimeShestsComponent', () => {
  let component: TasksTimeShestsComponent;
  let fixture: ComponentFixture<TasksTimeShestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TasksTimeShestsComponent]
    });
    fixture = TestBed.createComponent(TasksTimeShestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
