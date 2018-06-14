import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeAccordionComponent } from './ae-accordion.component';

describe('AeAccordionComponent', () => {
  let component: AeAccordionComponent;
  let fixture: ComponentFixture<AeAccordionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeAccordionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
