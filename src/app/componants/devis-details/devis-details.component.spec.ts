import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisDetailsComponent } from './devis-details.component';

describe('DevisDetailsComponent', () => {
  let component: DevisDetailsComponent;
  let fixture: ComponentFixture<DevisDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisDetailsComponent]
    });
    fixture = TestBed.createComponent(DevisDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
