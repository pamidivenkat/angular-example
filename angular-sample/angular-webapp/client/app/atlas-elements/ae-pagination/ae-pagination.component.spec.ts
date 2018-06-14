import { BehaviorSubject } from 'rxjs/Rx';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AePaginationComponent } from './ae-pagination.component';

describe('AePaginatorComponent', () => {
  let component: AePaginationComponent;
  let fixture: ComponentFixture<AePaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AePaginationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AePaginationComponent);
    component = fixture.componentInstance;
    component.id = "testpaging";
    component.name = "testpaging";
    component.rows = 10;
    component.totalRecords = new BehaviorSubject(150);
    component.noOfPageLinks = 5;
    component.setCurrentPageActive(2);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('creates spies for each requested function', () => {
  //   expect(component.rows).toBeDefined();
  //   expect(component.).toBeDefined();
  //   expect(component.changePageToLast).toBeDefined();
  //   expect(component.changePageToNext).toBeDefined();
  //   expect(component.changePageToPrev).toBeDefined();
  // });

  // it('should getpage return current page', () => {
  //   component.rows = 10;
  //   component.first = 20;
  //   expect(component.getPage()).toEqual(2);
  // });

  it('should show first page link', () => {
    let nativeElement = fixture.nativeElement;
    //expect(nativeElement.querySelector('#firstPageBtn') === null).toBe(false);
    expect(nativeElement.querySelector('#firstPageBtn')).toBeDefined();
  });

  it('should show next page link', () => {
    let nativeElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#nextPageBtn')).toBeDefined();
  });

  it('should show previous page link', () => {
    let nativeElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#previousPageBtn')).toBeDefined();
  });

  it('should show last page link', () => {
    let nativeElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#lastPageBtn') ).toBeDefined();
  });

  // it('should show page links correct', async () => {
  //   component.pageLinkCount = 10;
  //   component.updatePageLinks();
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     let nativeElement = fixture.nativeElement;
  //     let pageAnchors = nativeElement.querySelectorAll('#pageLinkAnchor');
  //     expect(pageAnchors.length).toEqual(component.pageLinkCount);
  //   });
  // });

  // it('should first page link clickable', async () => {
  //   spyOn(component, 'changePageToFirst');
  //   let debugElement = fixture.debugElement;
  //   let inputElement: DebugElement = debugElement.query(By.css('#firstPageBtn'));

  //   inputElement.triggerEventHandler("anchorClick", null);
  //   fixture.whenStable().then(() => {
  //     expect(component.changePageToFirst).toHaveBeenCalled();
  //   });
  // });

  // it('should next page link clickable', async () => {
  //   spyOn(component, 'changePageToNext');
  //   let debugElement = fixture.debugElement;
  //   let inputElement: DebugElement = debugElement.query(By.css('#nextPageBtn'));

  //   inputElement.triggerEventHandler("anchorClick", null);
  //   fixture.whenStable().then(() => {
  //     expect(component.changePageToNext).toHaveBeenCalled();
  //   });
  // });

  // it('should previous page link clickable', async () => {
  //   spyOn(component, 'changePageToPrev');
  //   let debugElement = fixture.debugElement;
  //   let inputElement: DebugElement = debugElement.query(By.css('#previousPageBtn'));

  //   inputElement.triggerEventHandler("anchorClick", null);
  //   fixture.whenStable().then(() => {
  //     expect(component.changePageToPrev).toHaveBeenCalled();
  //   });
  // });

  // it('should last page link clickable', async () => {
  //   spyOn(component, 'changePageToLast');
  //   let debugElement = fixture.debugElement;
  //   let inputElement: DebugElement = debugElement.query(By.css('#lastPageBtn'));

  //   inputElement.triggerEventHandler("anchorClick", null);
  //   fixture.whenStable().then(() => {
  //     expect(component.changePageToLast).toHaveBeenCalled();
  //   });
  // });

  // it('should rows per page option change event fired', async () => {
  //   spyOn(component, 'onRowsTotalChange');
  //   let debugElement = fixture.debugElement;
  //   let inputEl: DebugElement = debugElement.query(By.css('.select'));

  //   inputEl.triggerEventHandler("change", null);
  //   fixture.whenStable().then(() => {
  //     expect(component.onRowsTotalChange).toHaveBeenCalled();
  //   });
  // });

});
