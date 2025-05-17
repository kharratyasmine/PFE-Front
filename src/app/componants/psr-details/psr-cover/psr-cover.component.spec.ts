import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrCoverComponent } from './psr-cover.component';

describe('PsrCoverComponent', () => {
  let component: PsrCoverComponent;
  let fixture: ComponentFixture<PsrCoverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsrCoverComponent]
    });
    fixture = TestBed.createComponent(PsrCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
