import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeNumericStepperComponent } from './ae-numeric-stepper.component';

describe('AeNumericStepperComponent', () => {
  let component: AeNumericStepperComponent;
  let fixture: ComponentFixture<AeNumericStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeNumericStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeNumericStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
