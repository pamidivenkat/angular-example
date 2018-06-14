/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeNav } from '../common/ae-nav.enum';

import { AeAnchorComponent } from './ae-anchor.component';


describe('AeAnchorComponent', () => {
  let component: AeAnchorComponent;
  let fixture: ComponentFixture<AeAnchorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeAnchorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeAnchorComponent);
    component = fixture.componentInstance;
    component.id = "testanchorid";
    component.name = "testanchorname";
    component.class="testanchorclass";
    component.anchorText = "Click Here";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy(); 
  });

  it('should id and name attributes for all necessary items', () => {
    let inputEl: DebugElement = fixture.debugElement.query(By.css('.testanchorclass'));
    expect(inputEl.nativeElement.id).toEqual("testanchorid");

    // let anchorEl: HTMLAnchorElement = inputEl.query(By.css('a')).nativeElement;
    // expect(anchorEl.id).toEqual("testanchorid_anc");
    // expect(anchorEl.name).toEqual("testanchorname_anc");

  });

 it('Check whether given achor text is displayed in the UI or not', () => {
    let inputEl: DebugElement = fixture.debugElement.query(By.css('.testanchorclass'));
    //let anchorEl: HTMLElement = inputEl.query(By.css('a')).nativeElement;  
    expect(inputEl.nativeElement.innerHTML.toString().trim()).toBe('Click Here');
  });

  it('Test the Anchor styles are applied or not when operated as Button', () => {
    fixture = TestBed.createComponent(AeAnchorComponent);
    component = fixture.componentInstance;
    component.id = "testanchorid";
    component.name = "testanchorname";
    component.class="testbuttonclass"
    component.anchorText = "Click Here";
    component.anchorType = "button";
    fixture.detectChanges();

    let inputEl: DebugElement = fixture.debugElement.query(By.css('.testbuttonclass'));
    let anchorEl: HTMLElement = inputEl.nativeElement;// query(By.css('a')).nativeElement;
    let hasButtonClass = anchorEl.classList.contains('button');
    expect(hasButtonClass).toBe(true);
  });

  it('Test the Anchor styles are applied or not when operated as Button with light class', () => {
    fixture = TestBed.createComponent(AeAnchorComponent);
    component = fixture.componentInstance;
    component.id = "testanchorid";
    component.name = "testanchorname";
    component.class="testbuttonclass"
    component.anchorText = "Click Here";
    component.anchorType = "button";
    component.anchorClass = AeClassStyle.Light;
    fixture.detectChanges();

    let inputEl: DebugElement = fixture.debugElement.query(By.css('.testbuttonclass'));
    let anchorEl: HTMLElement = inputEl.nativeElement; //.query(By.css('a')).nativeElement;
    let hasButtonClass = anchorEl.classList.contains('button');
    let hasLightClass = anchorEl.classList.contains('button--light');
    let hasDarkClass = anchorEl.classList.contains('button--dark');
    expect(hasButtonClass).toBe(true);
    expect(hasLightClass).toBe(true);
    expect(hasDarkClass).toBe(false);
  });

 it('Test the Anchor styles are applied or not when operated previous or next buttons', () => {
    fixture = TestBed.createComponent(AeAnchorComponent);
    component = fixture.componentInstance;
    component.id = "testanchorid";
    component.name = "testanchorname";
    component.class="testbuttonclass"
    component.anchorText = "Click Here";
    component.anchorType = "button";
    component.anchorClass = AeClassStyle.Light;
    component.navType = AeNav.Forward;
    fixture.detectChanges();

    let inputEl: DebugElement = fixture.debugElement.query(By.css('.testbuttonclass'));
    let anchorEl: HTMLElement = inputEl.nativeElement; // query(By.css('a')).nativeElement;
    
    let hasforwardClass = anchorEl.classList.contains('button--forward');
    let hasBakcClass = anchorEl.classList.contains('button--back');
    expect(hasforwardClass).toBe(true);    
    expect(hasBakcClass).toBe(false);
  });

});
