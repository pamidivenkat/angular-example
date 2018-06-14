
import { equal } from 'assert';
import { AeInputType } from '../common/ae-input-type.enum';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AeInputComponent } from './ae-input.component';


describe('AeInputComponent', () => {
  let component: AeInputComponent<string>;
  let fixture: ComponentFixture<AeInputComponent<string>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeInputComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeInputComponent);
    component = fixture.componentInstance;
    component.id="inputid";
    component.name="inputname";
    component.type=AeInputType.number;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 /* Properties :: _min */
  it('should be greater than or equal to minimum value -9999', function(){
  	expect(component.min).toBeGreaterThanOrEqual(-9999);

    component.min = -1;
    expect(component.min).toBeGreaterThanOrEqual(-9999);

    component.min = -10000;
    expect(component.min).not.toBeGreaterThanOrEqual(-9999);
  });

/* Properties :: _max */
  it('should be less than or equal to maximum value 9999', function(){
  	expect(component.max).toBeLessThanOrEqual(9999);

    component.max = 20;
    expect(component.max).toBeLessThanOrEqual(20);

    component.max = 120;
    expect(component.max).not.toBeLessThanOrEqual(100);
  });

function getAllEnumValues(enumObject){
   var all = [];
   for(var key in enumObject){
      all.push(enumObject[key]);
   }
   return all;
}

/* Properties :: _type */
   xit('should be from specified input types', function(){
     for (let itmInputType of getAllEnumValues(AeInputType)) {
       component.type= itmInputType;
       expect(component.type).toEqual(itmInputType);
      }    
  });

// /* Properties :: _type */
//   it('should return exception when trying to set other than AeInputType (using try catch)', function() {
//     expect(function(){
//       return component.type= "testinputtype"; // some sample text which is not part of AeInputType it throw "Invalid type attribute" error;
//     }).toThrow();
// });



/* Properties :: _placeholder */
  it('should be equal to placeholder text thats been set', function(){
       component.placeholder = "User name";
       expect(component.placeholder).toEqual("User name");

        component.placeholder = "First name";
       expect(component.placeholder).not.toEqual("User name");
  });

  /* Properties :: _disabled */
  xit('should set disable true or false based on given input', function(){
       component.setDisabledState(false);
       expect(component._disabled).toEqual(false);

       component._disabled = true;
       expect(component._disabled).toEqual(true);

       component._disabled = null;
       expect(component._disabled).toEqual(false);
  });

   /* Properties :: _readOnly */
  xit('should set readonly true or false based on given input', function(){
      
       component.readOnly = true;
       expect(component.readOnly).toEqual(true);

       component.readOnly = false;
       expect(component.readOnly).toEqual(false);       

       component.readOnly = null;
       expect(component.readOnly).toEqual(false);
  });

    /* Properties :: _step */
  it('should set step value based on given input', function(){
       component.type =AeInputType.number ;
       component.step = 10;
       expect(component.step).toEqual(10);

       component.type =AeInputType.number ;
       component.step = 20;
       expect(component.step).not.toEqual(11);

       component.type =AeInputType.text ;
       component.step = 40;
       expect(component.step).not.toEqual(40);

  });


  /* Properties :: _autocomplete */
  it('should set autocomplete value based on given input on/off. If nothing specified it should be off', function(){
       component.autocomplete = "on";
       expect(component.autocomplete).toEqual("on");

       component.autocomplete = "off";
       expect(component.autocomplete).toEqual("off");

       component.autocomplete = "";
       expect(component.autocomplete).toEqual("off");

  });



/* Properties :: _type */
//  it('should get specified control type or null', function(){
//   	  for (let itmInputType of AeInputType) {
//        component.type= itmInputType;
//        expect(component.controlType()).toEqual(itmInputType);
//       } 
//   });

  
/* Properties :: isNumber */
 it('should specify given input type is number or not', function(){
      component.type=AeInputType.number;
      expect(component.isNumber).toEqual(true);

      component.type=AeInputType.email;
      expect(component.isNumber).not.toEqual(true);
      
  });

/* Properties :: isSeachInput */
   it('should specify given input type is search or not', function(){
  	    component.type=AeInputType.search;
      expect(component.isSeachInput).toEqual(true);

      component.type=AeInputType.email;
      expect(component.isSeachInput).not.toEqual(true);
  });

  it('should fire blur', async () => {  
    spyOn(component, 'onBlur');
    let rootElement = fixture.debugElement.query(By.css('#inputid'));  
    rootElement.triggerEventHandler("blur", null);    
    fixture.whenStable().then(() => {
      expect(component.onBlur).toHaveBeenCalled();
    });
  });

   it('should fire focus', async () => {
    spyOn(component, 'onFocus');
    let rootElement = fixture.debugElement.query(By.css('#inputid'));
    rootElement.triggerEventHandler("focus", null);
    fixture.whenStable().then(() => {
      expect(component.onFocus).toHaveBeenCalled();
    });
  });

    it('should fire change event', async () => { 
    spyOn(component, '_onChange');
    let inputElement = fixture.debugElement.query(By.css('#inputid'));
    inputElement.triggerEventHandler("change", null);
    fixture.whenStable().then(() => {
      expect(component._onChange).toHaveBeenCalled();
    });
  });

  xit('should fire change event and update value', async () => {
     spyOn(component, '_onChange');
     component.value = "mytext";
     fixture.detectChanges();
     let inputElement = fixture.debugElement.query(By.css('#inputid')).nativeElement;   
     expect(component.value).toEqual(inputElement.value);    
  });
    

});
