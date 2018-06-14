// import * as Immutable from 'immutable';
// import { AeRadioButtonComponent } from '../ae-radiobutton/ae-radiobutton.component';
// import { AeRadioItem } from '../common/models/ae-radio-item';
// /* tslint:disable:no-unused-variable */
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
// import { AeRadioGroupComponent } from './ae-radio-group.component';

// describe('AeRadioGroupComponent', () => {
//   let component: AeRadioGroupComponent;
//   let fixture: ComponentFixture<AeRadioGroupComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ AeRadioGroupComponent, AeRadioButtonComponent ],
//       schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(AeRadioGroupComponent);
//     component = fixture.componentInstance;
//     component.id = 'radioid';
//     component.name = 'radioname';
//     // tslint:disable-next-line:max-line-length
//     component.options = Immutable.List([new AeRadioItem({ Text: 'H&S', Value: 0, Disabled: false }), new AeRadioItem({ Text: 'EL', Value: 1, Disabled: true }), new AeRadioItem({ Text: 'Both', Value: 2, Disabled: false })]);
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

  // it('count of radio buttons  should match with input options count ', () => {
  //   let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
  //   let radioCount = inputEl.querySelectorAll('input').length;
  //   expect(radioCount).toEqual(component.options.count());
  // });

//  it('each radio button should have id specified ', () => {
//     let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
//     let radioButtonOne = inputEl.querySelectorAll('input')[0];
//     expect(radioButtonOne.getAttribute('id')).toEqual('radioid-0');
//   });

//   it('each radio button should have name and it should be same for all radio buttons', () => {
//     let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
//     let radioButtons = inputEl.querySelectorAll('input');
//     expect(radioButtons[0].getAttribute('name')).toEqual('radioname');
//     expect(radioButtons[0].getAttribute('name')).toEqual(radioButtons[1].getAttribute('name'));
//     expect(radioButtons[0].getAttribute('name')).toEqual(radioButtons[2].getAttribute('name'));
//   });

//  it('each radio button should have value and text', () => {
//     let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
//     let radioButtons = inputEl.querySelectorAll('input');
//     expect(radioButtons[0].getAttribute('value')).toEqual('0');
//      let labels = inputEl.querySelectorAll('label');
//      expect(labels[0].innerText).toEqual('H&S');
//   });

//   it('radio button should be disabled if it is specified as disabled in options', () => {
//     let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
//     let radioButtons = inputEl.querySelectorAll('input');
//     expect(radioButtons[1].getAttribute('disabled')).toBeDefined();
//   });
// });
