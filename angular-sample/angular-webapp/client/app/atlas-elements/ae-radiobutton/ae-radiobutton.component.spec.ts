import { AeRadioItem } from '../common/models/ae-radio-item';
import { AeRadioButtonComponent } from './ae-radiobutton.component';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';



describe('AeRadioButtonComponent', () => {
  let component: AeRadioButtonComponent<string>;
  let fixture: ComponentFixture<AeRadioButtonComponent<string>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeRadioButtonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeRadioButtonComponent);
    component = fixture.componentInstance;
      component.id = 'testradio';
    component.name = 'testradio';
    //component.value = new AeRadioItem(5);
   component.text = 'H&S';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 xit('each radio button should have id specified ', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let radioButton = inputEl.querySelectorAll('input')[0];
    expect(radioButton.getAttribute('id')).toBeDefined();
  });

  xit('each radio button should have name and it should be same for all radio buttons', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let radioButton = inputEl.querySelectorAll('input')[0];
     expect(radioButton.getAttribute('name')).toEqual('testradio');
  });

 xit('each radio button should have value and text', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let radioButton = inputEl.querySelectorAll('input')[0];
    expect(radioButton.getAttribute('value')).toBeDefined();
     let labels = inputEl.querySelectorAll('label');
     expect(labels[0].innerText).toEqual('H&S');
  });

  xit('radio button should be disabled if it is specified as disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let radioButton = inputEl.querySelectorAll('input')[0];
    expect(radioButton.getAttribute('disabled')).toBeDefined();
  });
  xit('radio button should have class radio__input', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let radioButton = inputEl.querySelectorAll('input')[0];
    expect(radioButton.className).toEqual('radio__input');
  });
   xit('radio button component should have label', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    let label = inputEl.querySelectorAll('label');
    expect(label).toBeDefined();
  });
});
