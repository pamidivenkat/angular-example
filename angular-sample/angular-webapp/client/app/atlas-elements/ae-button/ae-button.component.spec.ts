/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeButtonComponent } from './ae-button.component';
import { AePosition } from '../common/ae-position.enum';

describe('AeButtonComponent', () => {
  let component: AeButtonComponent;
  let fixture: ComponentFixture<AeButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeButtonComponent);
    component = fixture.componentInstance;
    component.id = "testbutton";
    component.name = "testbutton";
    fixture.detectChanges();
  });

  it('should have a defined component', () => {
    expect(component).toBeDefined();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should set button--light class on Light enum', () => {
    component.buttonClass = AeClassStyle.Light;
    component.isLight();
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('#testbutton')).nativeElement;
    expect(inputEl.classList.contains('button--light')).toEqual(true);
  });

  xit('should set button--dark class on Dark enum', () => {
    component.buttonClass = AeClassStyle.Dark;
    component.isDark();
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('#testbutton')).nativeElement;
    expect(inputEl.classList.contains('button--dark')).toEqual(true);
  });

  it('should visible/hide Icon based on the input Icon', () => {
    component.iconType = 'icon-settings';
    component.viewIcon();
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.button__icon')) === null).toBe(false);

    component.iconType = '';
    component.viewIcon();
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.button__icon')) === null).toBe(true);
  });

  it('should enabled/disabled based on disabled attribute value', () => {
    component.disabled = true;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(inputEl.hasAttribute("disabled")).toEqual(true);

    component.disabled = false;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(inputEl.hasAttribute("disabled")).not.toEqual(true);
  });

  it('should display text based on the input text', () => {
    component.buttonText = "button text1";
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(inputEl.innerText).toEqual(component.buttonText.toUpperCase());
  });

  it('button should be clickable', async () => {
    spyOn(component, '_onClick');
    let debugElement = fixture.debugElement;
    let inputElement: DebugElement = fixture.debugElement.query(By.css('#testbutton'));

    inputElement.triggerEventHandler("click", null);
    fixture.whenStable().then(() => {
      expect(component.onClick).toHaveBeenCalled();
    });
  });

});
