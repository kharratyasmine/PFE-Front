import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesComponent } from './demandes.component';

describe('DemandesComponent', () => {
  let component: DemandesComponent;
  let fixture: ComponentFixture<DemandesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemandesComponent]
    });
    fixture = TestBed.createComponent(DemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
