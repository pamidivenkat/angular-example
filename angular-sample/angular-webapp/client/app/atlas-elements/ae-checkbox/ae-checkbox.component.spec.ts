import { StringHelper } from '../../shared/helpers/string-helper';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {  CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { AeCheckboxComponent } from './ae-checkbox.component';
import { AeIconSize } from '../common/ae-icon-size.enum';

describe('AeCheckboxComponent', () => {
  let component: AeCheckboxComponent;
  let fixture: ComponentFixture<AeCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeCheckboxComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeCheckboxComponent);
    component = fixture.componentInstance;
    component.id = "testcheckboxId";
    component.name = "testcheckboxName";
    component.iconVisible = true;
    component.textVisible = true;
    component.checkboxText = "click here";
    component.iconName = "icon-bell";
    component.color = "red";
    component.iconSize = AeIconSize.medium;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('top level div and other component elements should have proper id and name', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let checkboxId = inputEl.id;
    expect(checkboxId).toEqual("testcheckboxId");
    let aeiCon: HTMLInputElement = fixture.debugElement.query(By.css('ae-icon')).nativeElement;
    expect(aeiCon.id).toEqual("testcheckboxId_aeIcon");
    expect(aeiCon.name).toEqual("testcheckboxName_aeIconName");
    let checkboxInput: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(checkboxInput.id).toEqual("testcheckboxId_iChkBox");
    expect(checkboxInput.name).toEqual("testcheckboxName_nChkBox");
  });

  xit('if check is clicked it click event should be fired', () => {
    let checkboxInput: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;
    spyOn(component, '_onChange');
    //dispatchEvent(checkboxInput, 'change');
    fixture.detectChanges();
    expect(component._onChange).toHaveBeenCalled();
  });

  xit('if check is clicked it click event should emit correct value', () => {
    let checkboxInput: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;
    spyOn(component, '_onChange');
    var ev = new Event("change", { "bubbles": true, "cancelable": false });
    //dispatchEvent(checkboxInput, 'change');
    fixture.detectChanges();
    expect(component._onChange).toHaveBeenCalledWith(ev);
    var ev = new Event("change", { "bubbles": true, "cancelable": false });
    //dispatchEvent(checkboxInput, 'change');
    fixture.detectChanges();
    expect(component._onChange).toHaveBeenCalledWith(ev);
  });

  xit('the given text should be displayed in the label', () => {
    let labelEL: DebugElement = fixture.debugElement.query(By.css('label'));
    let spanEL: HTMLElement = labelEL.query(By.css('span')).nativeElement;
    expect(spanEL.innerHTML).toBe(component.checkboxText);
  });

  it('When icon and text are configured as false it should not have those elements', () => {
    fixture = TestBed.createComponent(AeCheckboxComponent);
    component = fixture.componentInstance;
    component.id = "testcheckboxId";
    component.name = "testcheckboxName";
    component.iconVisible = false;
    component.textVisible = false;
    component.checkboxText = "click here";
    fixture.detectChanges();
    let labelEL: DebugElement = fixture.debugElement.query(By.css('label'));
    let spanEL: DebugElement = labelEL.query(By.css('span'));
    expect(spanEL).toBeNull();
    let aeiCon: DebugElement = fixture.debugElement.query(By.css('ae-icon'));  
    expect(aeiCon).toBeNull();
  });


});
