/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeTemplateLoaderComponent } from './ae-template-loader.component';

describe('AeTemplateLoaderComponent', () => {
  let component: AeTemplateLoaderComponent<any>;
  let fixture: ComponentFixture<AeTemplateLoaderComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeTemplateLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeTemplateLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
