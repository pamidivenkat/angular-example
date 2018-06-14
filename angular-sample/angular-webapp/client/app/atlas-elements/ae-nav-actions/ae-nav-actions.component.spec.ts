/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AeNavActionsComponent } from './ae-nav-actions.component';

describe('AeNavActionsComponent', () => {
  let component: AeNavActionsComponent<any>;
  let fixture: ComponentFixture<AeNavActionsComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeNavActionsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeNavActionsComponent);
    component = fixture.componentInstance;
    component.id="testsplit";
    component.name="testsplitname";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
