/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeSwitchComponent } from './ae-switch.component';

describe('AeSwitchComponent', () => {
  let component: AeSwitchComponent<boolean>;
  let fixture: ComponentFixture<AeSwitchComponent<boolean>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSwitchComponent);
    component = fixture.componentInstance;
      component.id="testswitch";
    component.name="testswitch";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
