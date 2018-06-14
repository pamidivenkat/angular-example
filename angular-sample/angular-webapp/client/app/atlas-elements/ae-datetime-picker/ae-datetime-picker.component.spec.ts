import { FormsModule } from '@angular/forms';
import { AeSelectComponent } from '../ae-select/ae-select.component';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AeDatetimePickerComponent } from './ae-datetime-picker.component';
import { AeInputComponent } from '../ae-input/ae-input.component';
import { AeButtonComponent } from '../ae-button/ae-button.component';
import { AeAnchorComponent } from '../ae-anchor/ae-anchor.component';
import { AeIconComponent } from '../ae-icon/ae-icon.component';

describe('Date Picker - Date Mode', () => {
  let component: AeDatetimePickerComponent<any>;
  let fixture: ComponentFixture<AeDatetimePickerComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule
        , FormsModule
      ],
      declarations: [AeDatetimePickerComponent
        , AeInputComponent
        , AeButtonComponent
        , AeAnchorComponent
        , AeIconComponent
        , AeSelectComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(AeDatetimePickerComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeDatetimePickerComponent);
    component = fixture.componentInstance;
    component.id = 'datepicker';
    component.name = 'datepicker';
    component.showIcon = true;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have id', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(inputEl.getAttribute('id')).toEqual('datepicker');
  });

  it('should be disabled when disabled input set to true', () => {
    component.disabled = true;
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('ae-button')).nativeElement;
    expect(inputEl.classList.contains('ui-state-disabled')).toBeTruthy();
  });

  it('should be enabled when disabled input set to false', () => {
    component.disabled = false;
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('ae-button')).nativeElement;
    expect(inputEl.classList.contains('ui-state-disabled')).toBeFalsy();
  });
  it('component should show calendar icon when showicon is set to true', () => {
    component.showIcon = true;
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: DebugElement = fixture.debugElement.query(By.css('#datepicker_ae-button_4_aeButton_1'));
    expect(inputEl).toBeDefined();
  });

  it('component should hide calendar icon when showicon is set to false', () => {
    component.showIcon = false;
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: DebugElement = fixture.debugElement.query(By.css('#datepicker_ae-button_4_aeButton_1'));
    expect(inputEl).toBeNull();
  });
  it('should show date picker when clicked on calendar icon', () => {
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let dateSelector = fixture.debugElement.query(By.css('.ui-datepicker-calendar'));
    expect(dateSelector).not.toBeNull();
  });
  it('should hide date time selection in default mode', () => {
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let timeSelector = fixture.debugElement.query(By.css('.ui-timepicker'));
    expect(timeSelector).toBeNull();
  });
  it('should show given placeholder in input element', () => {
    component.placeholder = 'please select date';
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('#datepicker_ae-input_3')).nativeElement;
    expect(inputEl.getAttribute('placeholder')).toEqual('please select date');
  });
  it('input element should be readonly when readonlyInput value set to true', () => {
    component.readonlyInput = true;
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('#datepicker_ae-input_3')).nativeElement;
    expect(inputEl.getAttribute('readonly')).toBeTruthy();
  });
  it('input element should show the given date value', () => {
    component.defaultDate = new Date();
    component.ngOnInit();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('#datepicker_ae-input_3')).nativeElement;
    expect(inputEl.value).toEqual(component.formatDate(component.defaultDate, component.dateFormat));
  });

  it('should show current month name and current year by default in header', () => {
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let monthIndicator = fixture.debugElement.query(By.css('.ui-datepicker-month')).nativeElement;
    let yearIndicator = fixture.debugElement.query(By.css('.ui-datepicker-year')).nativeElement;
    expect(monthIndicator.innerText).toEqual(component.currentMonthText);
    expect(yearIndicator.innerText).toEqual(component.currentYear.toString());
  });
  it('should show month  and year drop down when monthNavigator, yearNavigator set to true', () => {
    component.monthNavigator = true;
    component.yearNavigator = true;
    component.ngOnInit();
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let monthNavigator: DebugElement = fixture.debugElement.query(By.css('#datepicker_ae-select_10'));
    let yearNavigator: DebugElement = fixture.debugElement.query(By.css('#datepicker_ae-select_11'));
    expect(monthNavigator).not.toBeNull();
    expect(yearNavigator).not.toBeNull();
    let monthOptionElements: HTMLCollection[] = monthNavigator.nativeElement.children;
    let yearOptionElements: HTMLCollection[] = yearNavigator.nativeElement.children;
    expect(monthOptionElements.length).toEqual(component.monthOptions.size);
    expect(yearOptionElements.length).toEqual(component.yearOptions.size);
  });
  it('should show selected date in the input field', () => {
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let datesDisplayed: DebugElement[] = fixture.debugElement.queryAll(By.css('.ui-state-default'));
    datesDisplayed[10].nativeElement.click();
    fixture.detectChanges();
    let inputElement = fixture.debugElement.query(By.css('#datepicker_ae-input_3')).nativeElement;
    expect(inputElement.value).toEqual(component.inputFieldValue);
  });
});

describe('Date Picker - Date & Time Mode', () => {
  let component: AeDatetimePickerComponent<any>;
  let fixture: ComponentFixture<AeDatetimePickerComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule
        , FormsModule
      ],
      declarations: [AeDatetimePickerComponent
        , AeInputComponent
        , AeButtonComponent
        , AeAnchorComponent
        , AeIconComponent
        , AeSelectComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(AeDatetimePickerComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeDatetimePickerComponent);
    component = fixture.componentInstance;
    component.id = 'datepicker';
    component.name = 'datepicker';
    component.showTime = true;
    component.showIcon = true;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it('should show date picker with time selection when clicked on calendar icon', () => {
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let dateSelector = fixture.debugElement.query(By.css('.ui-datepicker-calendar'));
    let timeSelector = fixture.debugElement.query(By.css('.ui-timepicker'));
    expect(dateSelector).not.toBeNull();
    expect(timeSelector).not.toBeNull();
  });
  it('should show current time by default in time selection', () => {
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let timeSelector = fixture.debugElement.query(By.css('.ui-timepicker'));
    expect(timeSelector).not.toBeNull();
    let hoursElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_15'));
    expect(hoursElement).not.toBeNull();
    let minutesElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_21'));
    expect(minutesElement).not.toBeNull();
    let currentTime = new Date();
    expect(currentTime.getHours()).toEqual(Number(hoursElement.nativeElement.innerText.trim()));
    expect(currentTime.getMinutes()).toEqual(Number(minutesElement.nativeElement.innerText.trim()));
  });
  it('should show seconds when showseconds is true', () => {
    component.showSeconds = true;
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let secondsElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_27'));
    expect(secondsElement).not.toBeNull();
  });
  it('should be able to change the time', () => {
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let currentTime = new Date();
    let currentHour = currentTime.getHours();
    let currentMinutes = currentTime.getMinutes();
    let hoursElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_15'));
    let minutesElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_21'));
    expect(currentHour).toEqual(Number(hoursElement.nativeElement.innerText.trim()));
    expect(currentMinutes).toEqual(Number(minutesElement.nativeElement.innerText.trim()));
    let hoursIncrementElement: HTMLElement = fixture.debugElement.query(By.css('#datepicker_ae-anchor_16')).nativeElement;
    let minutesIncrementElement: HTMLElement = fixture.debugElement.query(By.css('#datepicker_ae-anchor_22')).nativeElement;
    hoursIncrementElement.click();
    minutesIncrementElement.click();
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    expect((currentHour + 1)).toEqual(Number(hoursElement.nativeElement.innerText.trim()));
    expect((currentMinutes + 1)).toEqual(Number(minutesElement.nativeElement.innerText.trim()));
  });

  it('should show selected date & time in the input field', () => {
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('click', null);
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let datesDisplayed: DebugElement[] = fixture.debugElement.queryAll(By.css('.ui-state-default'));
    datesDisplayed[10].nativeElement.click();
    fixture.detectChanges();
    let inputElement = fixture.debugElement.query(By.css('#datepicker_ae-input_3')).nativeElement;
    expect(inputElement.value).toEqual(component.inputFieldValue);
  });
});

describe('Date Picker - Date & Time With AM/PM', () => {
  let component: AeDatetimePickerComponent<any>;
  let fixture: ComponentFixture<AeDatetimePickerComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule
        , FormsModule
      ],
      declarations: [AeDatetimePickerComponent
        , AeInputComponent
        , AeButtonComponent
        , AeAnchorComponent
        , AeIconComponent
        , AeSelectComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(AeDatetimePickerComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeDatetimePickerComponent);
    component = fixture.componentInstance;
    component.id = 'datepicker';
    component.name = 'datepicker';
    component.showTime = true;
    component.showIcon = true;
    component.hourFormat = '12';
    component.defaultDate = new Date();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it('should show AM/PM selection', () => {
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let ampmSelectionElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_31'));
    expect(ampmSelectionElement).not.toBeNull();
    let currentHour = new Date().getHours();
    let isPm = currentHour > 11;
    let meridianText = isPm ? 'PM' : 'AM';
    expect(ampmSelectionElement.nativeElement.innerText.trim()).toEqual(meridianText);
  });
  it('should toggle AM/PM', () => {
    let inputEl = fixture.debugElement.query(By.css('ae-input'));
    component.showOverlay(inputEl);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    let ampmSelectionElement: DebugElement = fixture.debugElement.query(By.css('#datepicker_div_31'));
    expect(ampmSelectionElement).not.toBeNull();
    let toggleElement: HTMLElement = fixture.debugElement.query(By.css('#datepicker_ae-anchor_32')).nativeElement;
    toggleElement.click();
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    ampmSelectionElement = fixture.debugElement.query(By.css('#datepicker_div_31'));
    let isPm = component.currentHour > 11;
    let meridianText = isPm ? 'PM' : 'AM';
    expect(ampmSelectionElement.nativeElement.innerText.trim()).toEqual(meridianText);
  });
});

