import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTrakerComponent } from './task-traker.component';

describe('TaskTrakerComponent', () => {
  let component: TaskTrakerComponent;
  let fixture: ComponentFixture<TaskTrakerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskTrakerComponent]
    });
    fixture = TestBed.createComponent(TaskTrakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
