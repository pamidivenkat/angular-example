import { AeAnchorComponent } from './../ae-anchor/ae-anchor.component';
import { AeIconComponent } from '../ae-icon/ae-icon.component';
import { DebugElement } from '@angular/core';
import { AeListStyle } from '../common/ae-list-style.enum';
import { AeListItem } from '../common/models/ae-list-item';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed  } from '@angular/core/testing';


import { AeListComponent } from './ae-list.component';
import * as Immutable from 'immutable';

describe('AeListComponent', () => {
  let component: AeListComponent;
  let fixture: ComponentFixture<AeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({    
      declarations: [ AeListComponent, AeAnchorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeListComponent);
    component = fixture.componentInstance;

    component.id = "testlist";
    component.name = "testlist";
    component.items = Immutable.List<AeListItem>([new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead, LinkText: "Click Here" }),
    new AeListItem({ Text: "Item Two Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Three Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Four Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Five Text Goes Here.", HasAction: false, ItemType: AeListStyle.Normal, LinkText: "Sample Text" })]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ul should has "list" class', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('ul')).nativeElement;
    let hasClass = inputEl.classList.contains("list");
    expect(hasClass).toEqual(true);
  });

  it('count of li elements should match with component items count ', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('ul')).nativeElement;
    var liCount = inputEl.querySelectorAll('li').length;
    expect(liCount).toEqual(component.items.count());
  });

  it('Text property should bind properly in li', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('ul')).queryAll(By.css('li'))[0].nativeElement;
    var spanEl = inputEl.querySelectorAll('span')[0];
    expect(spanEl.textContent.trim()).toContain(component.items.get(0).Text);
  });

  it('li should have action link based on hasaction property value', () => {
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    let inputTwoEl: HTMLElement = rootElement.queryAll(By.css('li'))[1].nativeElement;
    expect(inputEl.querySelector("a")).not.toBe(null);
    expect(inputTwoEl.querySelector("a")).toBe(null);
  });

  it("action link's text should match with LinkText Property", () => {
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.querySelector("a").innerText).toEqual(component.items.get(0).LinkText);
  });

  it("action link's text should be default link text when link text is not provided", () => {
    component.items = component.items.set(0, new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead }));
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.querySelector("a").innerText).toEqual("Go Somewhere");
  });

  it("'list__item--notification' css class should add to li when item is of notification type ", () => {
    component.items = component.items.set(0,new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead }));
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    let hasClass = inputEl.classList.contains("list__item--notification");
    expect(hasClass).toEqual(true);

    component.items = component.items.set(0,new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.Normal }));
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    rootElement = fixture.debugElement.query(By.css('ul'));
    inputEl = rootElement.queryAll(By.css('li'))[0].nativeElement;
    hasClass = inputEl.classList.contains("list__item--notification");
    expect(hasClass).not.toEqual(true);
  });

  it("'list__item--left-line' css class should add to li based on HasLine property ", () => {
    component.hasLine = true;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.classList.contains("list__item--left-line")).toBe(true);

    component.hasLine = false;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    rootElement = fixture.debugElement.query(By.css('ul'));
    inputEl = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.classList.contains("list__item--left-line")).not.toBe(true);
  });

  it("div with 'list__left-line' css class should add to li based on HasLine property ", () => {
    component.hasLine = true;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    let rootElement = fixture.debugElement.query(By.css('ul'));
    let inputEl: HTMLElement = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.querySelector("div.list__left-line")).not.toBeNull();

    component.hasLine = false;
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    rootElement = fixture.debugElement.query(By.css('ul'));
    inputEl = rootElement.queryAll(By.css('li'))[0].nativeElement;
    expect(inputEl.querySelector("div.list__left-line")).toBeNull();
  });

  it('action link should be clickable', async () => {
    component.items = component.items.set(0,new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead }));
    fixture.componentInstance.cdRef.markForCheck();
    fixture.detectChanges();
    spyOn(component, 'onAeAction').and.callThrough();

    let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#testlist_ul_li_ActionAeAnchor_0');
    removeButton.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.onAeAction).toHaveBeenCalled();
    });
  });
});
