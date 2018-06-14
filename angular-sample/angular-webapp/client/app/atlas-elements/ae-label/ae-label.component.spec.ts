import { Orientation } from '../common/orientation.enum';
import { AeLabelStyle } from '../common/ae-label-style.enum';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AeLabelComponent } from './ae-label.component';

describe('AeLabelComponent', () => {
  let component: AeLabelComponent;
  let fixture: ComponentFixture<AeLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeLabelComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeLabelComponent);
    component = fixture.componentInstance;
    component.id = "testlabelId";
    component.name = "testlabelName";
    component.text = "default label text";
    component.style = AeLabelStyle.Medium;
    component.orientation = Orientation.Vertiacal;
    component.icon = "icon-bell";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('All elements created should have proper ids and names', () => {
    let topDiv: DebugElement = fixture.debugElement.query(By.css('div'));
    expect(topDiv.nativeElement.id).toEqual("testlabelId");
    let textDiv = topDiv.query(By.css('div'));
    expect(textDiv.nativeElement.id).toEqual("testlabelId_div");
    let aeIcon: DebugElement = fixture.debugElement.query(By.css('ae-icon'));
    expect(aeIcon.nativeElement.id).toEqual("testlabelId_aeIcon");
    expect(aeIcon.nativeElement.name).toEqual("testlabelName_aeIconName");
  });

 it('Given label text should be displayed in the UI', () => {
    let topDiv: DebugElement = fixture.debugElement.query(By.css('div'));
    expect(topDiv.nativeElement.id).toEqual("testlabelId");
    let textDiv:HTMLElement = topDiv.query(By.css('div')).nativeElement;
    expect(textDiv.innerHTML.toString().trim()).toBe('default label text');    
  });

it('Verify the correct css class is applied for the top div based on label text action', () => {
    let topDiv: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    //since the component is instantiated with AeLabelStyle.Medium, it should apply medium class but not bold and action css classes
       let hasMediumClass = topDiv.classList.contains("icon-with-text--medium");
       let hasActionClass = topDiv.classList.contains("icon-with-text--action");
       let hasBoldClass = topDiv.classList.contains("icon-with-text--bold");
       expect(hasMediumClass).toBe(true);
       expect(hasActionClass).toBe(false);
       expect(hasBoldClass).toBe(false);
  });

it('Verify the correct css class is applied based on the orientation', () => {
    let topSpan: HTMLElement = fixture.debugElement.query(By.css('span')).nativeElement;
    //since the component is instantiated with AeLabelStyle.Medium, it should apply medium class but not bold and action css classes
       let hasHorClass = topSpan.classList.contains("icon-horizontal");
       let hasVerClass = topSpan.classList.contains("icon-vertical");      
       expect(hasHorClass).toBe(false);
       expect(hasVerClass).toBe(true);       
  });

});
