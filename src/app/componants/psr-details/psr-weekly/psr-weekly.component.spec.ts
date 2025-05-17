import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrWeeklyComponent } from './psr-weekly.component';

describe('PsrWeeklyComponent', () => {
  let component: PsrWeeklyComponent;
  let fixture: ComponentFixture<PsrWeeklyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsrWeeklyComponent]
    });
    fixture = TestBed.createComponent(PsrWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
