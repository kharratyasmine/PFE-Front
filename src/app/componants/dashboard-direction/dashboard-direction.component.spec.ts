import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDirectionComponent } from './dashboard-direction.component';

describe('DashboardDirectionComponent', () => {
  let component: DashboardDirectionComponent;
  let fixture: ComponentFixture<DashboardDirectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardDirectionComponent]
    });
    fixture = TestBed.createComponent(DashboardDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
