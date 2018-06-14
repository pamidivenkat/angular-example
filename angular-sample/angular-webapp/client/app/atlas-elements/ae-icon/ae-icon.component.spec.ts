import { AeIconSize } from '../common/ae-icon-size.enum';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeIconComponent } from './ae-icon.component';

describe('AeIconComponent', () => {
  let component: AeIconComponent;
  let fixture: ComponentFixture<AeIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeIconComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeIconComponent);
    component = fixture.componentInstance;
    component.id = "testicon";
    component.name = "testicon";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('component should have "icon" class', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    let hasClass = inputEl.classList.contains("icon");
    expect(hasClass).toEqual(true);
  });

  xit('component should have "icon--medium" class when size attribute value is medium', () => {
    component.iconSize = AeIconSize.medium;
    component.iconName="IconName";
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    let hasClass = inputEl.classList.contains("icon-medium");   
    expect(hasClass).toEqual(true);
    expect(inputEl.classList.contains("icon--medium")).toEqual(true);
    expect(inputEl.classList.contains("icon--small")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--big")).not.toEqual(true);
  });

  xit('component should have "icon--small" class when size attribute value is small', () => {
    component.iconSize = AeIconSize.small;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.classList.contains("icon--medium")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--small")).toEqual(true);
    expect(inputEl.classList.contains("icon--big")).not.toEqual(true);
  });

  xit('component should have "icon--big" class when size attribute value is big', () => {
    component.iconSize = AeIconSize.big;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.classList.contains("icon--medium")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--small")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--big")).toEqual(true);
  });

  it('component should have "icon--big" class when size attribute value is big', () => {
    component.iconSize = AeIconSize.none;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.classList.contains("icon--medium")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--small")).not.toEqual(true);
    expect(inputEl.classList.contains("icon--big")).not.toEqual(true);
  });

  xit('component should have "icon--has-notification" class based on notify attribute value', () => {
    component.hasNotification = true;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.classList.contains("icon--has-notification")).toEqual(true);

    component.hasNotification = false;
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.classList.contains("icon--has-notification")).not.toEqual(true);
  });

  xit('component should have icon with provided color applied', () => {
    component.color = "lightblue";
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.style.color).toEqual("lightblue");

    function hexToRgb(hex) {
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')' : null;
    }


    component.color = "#FF5733";
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    expect(inputEl.style.color).toEqual(hexToRgb("#FF5733"));
  });

  xit('component should use provided icon/font name', () => {
    component.iconName = 'icon-settings';
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('div#testicon')).nativeElement;
    let attr:Attr = inputEl.querySelector('use').attributes.getNamedItem("xlink:href");
    expect(attr.value).toEqual('#icon-settings');
  });
});
