/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeSliderComponent } from './ae-slider.component';

describe('AeSliderComponent', () => {
  let component: AeSliderComponent;
  let fixture: ComponentFixture<AeSliderComponent>;
  let sliderInstance: AeSliderComponent;
  let sliderDebugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSliderComponent);
    component = fixture.componentInstance;
    component.id="atlas-slider";
    component.name="atlas-slider";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the default values', () => {   
      expect(component.value).toBe(0);
      expect(component.min).toBe(0);
      expect(component.max).toBe(100);
    });
});
