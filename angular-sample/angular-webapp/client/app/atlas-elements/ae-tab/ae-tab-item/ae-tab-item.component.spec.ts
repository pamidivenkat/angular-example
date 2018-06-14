/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeTabItemComponent } from './ae-tab-item.component';

describe('AeTabItemComponent', () => {
  let component: AeTabItemComponent;
  let fixture: ComponentFixture<AeTabItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeTabItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeTabItemComponent);
    component = fixture.componentInstance;
    component.id="_id";
    component.name="_tabName";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
