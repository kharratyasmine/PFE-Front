import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalTabComponent } from './technical-tab.component';

describe('TechnicalTabComponent', () => {
  let component: TechnicalTabComponent;
  let fixture: ComponentFixture<TechnicalTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TechnicalTabComponent]
    });
    fixture = TestBed.createComponent(TechnicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
