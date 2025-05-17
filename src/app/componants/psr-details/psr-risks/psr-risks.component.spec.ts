import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrRisksComponent } from './psr-risks.component';

describe('PsrRisksComponent', () => {
  let component: PsrRisksComponent;
  let fixture: ComponentFixture<PsrRisksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsrRisksComponent]
    });
    fixture = TestBed.createComponent(PsrRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
