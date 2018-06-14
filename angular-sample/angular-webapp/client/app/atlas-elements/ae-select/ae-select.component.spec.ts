import { FormControl, ReactiveFormsModule } from '@angular/forms';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeSelectComponent } from './ae-select.component';
//import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import * as Immutable from 'immutable';

export const ButtonClickEvents = {
   left:  { button: 0 },
   right: { button: 2 }
};

export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}

xdescribe('AeSelectComponent', () => {
  let component: AeSelectComponent<string>;
let fixture: ComponentFixture<AeSelectComponent<string>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeSelectComponent],
      imports: [ReactiveFormsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSelectComponent);
    component = fixture.componentInstance;
    component.id = "testselectid";
    component.name = "testselectname";
    component.options =  Immutable.List([{ Text: "Option 1", Value: "opt1",Disabled:false,Childrens:[] },
    { Text: "Option 2", Value: "opt2", Disabled: true,Childrens:[] },
    { Text: "Option 3", Value: "opt3",Disabled:false,Childrens:[] }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should id attribute has provided value', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
    expect(inputEl.getAttribute("id")).toEqual("testselectid");
  });

  it('should name attribute has provided value', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
    expect(inputEl.getAttribute("name")).toEqual("testselectname");
  });


  it('should display provided placeholder text as select element first option text', () => {
    fixture = TestBed.createComponent(AeSelectComponent);
    component = fixture.componentInstance;
    component.id = "testselectid";
    component.name = "testselectname";
    component.placeholder = "Select Option ...";
    component.options =  Immutable.List([{ Text: "Option 1", Value: "opt1",Disabled:false,Childrens:[] },
    { Text: "Option 2", Value: "opt2", Disabled: true,Childrens:[] },
    { Text: "Option 3", Value: "opt3",Disabled:false,Childrens:[] }]);
    // component.placeholder ="select options ...";
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
    expect(inputEl.querySelectorAll('option')[0].innerText).toEqual("Select Option ...");
    expect(inputEl.querySelectorAll('option')[0].getAttribute("value")).toEqual("");
  });

  it('should display default placeholder text "Please Select" when placeholder attribute is not supplied', () => {
    fixture = TestBed.createComponent(AeSelectComponent);
    component = fixture.componentInstance;
    component.id = "testselectid";
    component.name = "testselectname";
    component.placeholder = "Please Select";
   // component.options = Immutable.List([{ }]);
   fixture.detectChanges();

    let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
    expect(inputEl.querySelectorAll('option')[0].innerText).toEqual("Please Select");
    expect(inputEl.querySelectorAll('option')[0].getAttribute("value")).toEqual("");
  });

//Duplicate test case to above so commented it.
  // it('should display default placeholder text "Please Select" when placeholder attribute is not supplied', () => {
  //   let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
  //   expect(inputEl.querySelectorAll('option')[0].innerText).toEqual("Select Option ...");
  //   expect(inputEl.querySelectorAll('option')[0].getAttribute("value")).toEqual("");
  // });

  // it('should enabled/disabled based on disabled attribute value', () => {
  //   component.disabled = true;    
  //   component.changeState();
  //   fixture.detectChanges();
  //   let inputEl: HTMLElement = fixture.debugElement.query(By.css('select')).nativeElement;
  //   expect(inputEl.hasAttribute("disabled")).toEqual(true);

  //   component.disabled = false;    
  //   component.changeState();
  //   fixture.detectChanges();
  //   inputEl = fixture.debugElement.query(By.css('select')).nativeElement;
  //   expect(inputEl.hasAttribute("disabled")).not.toEqual(true);
  // });

//   it('should component value property update when user selects into it', fakeAsync(() => {
//     //spyOn(component, '_onChange');
//     component.value = "opt3";
//     fixture.detectChanges();
//     tick();
//     let inputEl = fixture.debugElement.query(By.css('select')).nativeElement;
//     const nycOption = fixture.debugElement.queryAll(By.css('option'))[3];
//     expect(inputEl.value).toEqual("opt3");
//     expect(nycOption.nativeElement.selected).toBe(true);

//     inputEl.value = 'opt1';
    
//     //inputEl.dispatchEvent('change');
//      //var ev = new Event("change", {"bubbles":true, "cancelable":false});
//     //fixture.debugElement.query(By.css('select')).triggerEventHandler('change',ev);
//     // click(inputEl);
//     // fixture.nativeElement.querySelector('select').change();
//     //var ev = new Event("change", {"bubbles":true, "cancelable":false});
//     dispatchEvent(inputEl,'change'); 
//     fixture.detectChanges();
//     tick();
// //component.value
//     expect(fixture.componentInstance.value).toEqual('opt1');
//     
//     //   //fixture.debugElement.query(By.css('select')).triggerEventHandler('change',null);
//     //   dispatchEvent(inputEl, 'change');
//     //   fixture.detectChanges();
//     //   tick();
//     //   expect(component.value).toEqual('opt1');
//     
//      
//     //   dispatchEvent(inputEl, 'change');
//     //   fixture.detectChanges();
//     
//     //     expect(component._onChange).toHaveBeenCalledWith("opt3");
//     //   
//     
//     // });

//     // tick();
//     // let inputEl = fixture.debugElement.query(By.css('select')).nativeElement;
//     /
//     // expect(inputEl.value).toEqual("opt3");

//     // inputEl.value = 'opt2';
//     // dispatchEvent(inputEl, 'change');
//     // tick();
//     // expect(component.value).toEqual('opt2');
//   }));


});
