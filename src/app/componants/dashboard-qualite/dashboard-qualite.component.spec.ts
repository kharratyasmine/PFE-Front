import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardQualiteComponent } from './dashboard-qualite.component';

describe('DashboardQualiteComponent', () => {
  let component: DashboardQualiteComponent;
  let fixture: ComponentFixture<DashboardQualiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardQualiteComponent]
    });
    fixture = TestBed.createComponent(DashboardQualiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
