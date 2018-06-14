/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeTextareaComponent } from './ae-textarea.component';

describe('AeTextareaComponent', () => {
  let component: AeTextareaComponent;
  let fixture: ComponentFixture<AeTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeTextareaComponent);
    component = fixture.componentInstance;
      component.id="testtextarea";
    component.name="testtextarea";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
