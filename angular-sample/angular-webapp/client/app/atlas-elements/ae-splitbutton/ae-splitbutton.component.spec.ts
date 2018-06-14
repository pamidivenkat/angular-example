/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AeSplitbuttonComponent } from './ae-splitbutton.component';

describe('AeSplitbuttonComponent', () => {
  let component: AeSplitbuttonComponent;
  let fixture: ComponentFixture<AeSplitbuttonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeSplitbuttonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSplitbuttonComponent);
    component = fixture.componentInstance;
    component.id="testsplit";
    component.name="testsplitname";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
