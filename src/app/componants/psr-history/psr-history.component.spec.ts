import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrHistoryComponent } from './psr-history.component';

describe('PsrHistoryComponent', () => {
  let component: PsrHistoryComponent;
  let fixture: ComponentFixture<PsrHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsrHistoryComponent]
    });
    fixture = TestBed.createComponent(PsrHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
