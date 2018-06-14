import { DebugElement } from '@angular/core';
import { AeListStyle } from '../common/ae-list-style.enum';
import { AeListItem } from '../common/models/ae-list-item';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeSortListComponent } from './ae-sort-list.component';
import * as Immutable from 'immutable';


describe('AeSortListComponent', () => {
  let component: AeSortListComponent;
  let fixture: ComponentFixture<AeSortListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeSortListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeSortListComponent);
    component = fixture.componentInstance;

   component.id = "'testsortlist'";
    component.name = "'testsortlist'";
    component.items = Immutable.List<AeListItem>([new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead, LinkText: "Click Here" }),
    new AeListItem({ Text: "Item Two Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Three Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Four Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text" }),
    new AeListItem({ Text: "Item Five Text Goes Here.", HasAction: false, ItemType: AeListStyle.Normal, LinkText: "Sample Text" })]);

    fixture.detectChanges();
  });

});
