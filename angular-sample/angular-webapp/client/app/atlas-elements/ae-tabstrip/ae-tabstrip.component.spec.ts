import { AeTemplateComponent } from '../ae-template/ae-template.component';
import { AeTabStripItemComponent } from './ae-tabstrip-item/ae-tabstrip-item.component';
import { Component } from '@angular/core';
import { AeIconComponent } from '../ae-icon/ae-icon.component';
import { AeLabelComponent } from '../ae-label/ae-label.component';
import { AeTemplateLoaderComponent } from '../ae-template-loader/ae-template-loader.component';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeTabStripComponent } from './ae-tabstrip.component';

xdescribe('AeTabComponent', () => {
  let component: AeTabStripComponent;
  let fixture: ComponentFixture<AeTabStripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeTabStripComponent, AeTabStripItemComponent, AeTemplateComponent, AeTemplateLoaderComponent, AeLabelComponent,AeIconComponent, 
      TestTabWithStandardHeaderWithAllData, TestTabWithStandardHeaderWithoutTabContent, TestTabWithStandardHeaderWithoutTabHeader, 
      TestTabWithStandardHeaderWithIconWithAllData, TestTabWithTemplatedHeaderWithAllData, TestTabWithoutTabItemIDAndName, TestTabWithoutTemplateType, 
      TestTabWithOnlyId, TestTabWithOnlyName, TestEmptyTab ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeTabStripComponent);
    component = fixture.componentInstance;
    component.id = "testtabstripid";
    component.name = "testtabstripname";
    fixture.detectChanges();
  });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

// it('should create tab component', () => {
//     let fixture = TestBed.createComponent(TestEmptyTab);
//     let component = fixture.componentInstance;
//     expect(component).toBeTruthy();
//   });

  it('should not create component when id is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithOnlyName);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithOnlyName class TestTabWithOnlyName - inline template:1:2 caused by: id is mandatory');
  });

  it('should not create component when name is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithOnlyId);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithOnlyName class TestTabWithOnlyName - inline template:1:12 caused by: name is mandatory');
  });

  it('should not show tab header text when tab header is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithStandardHeaderWithoutTabHeader);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithStandardHeaderWithoutTabHeader class TestTabWithStandardHeaderWithoutTabHeader - inline template:1:2 caused by: tab header is mandatory');
  });

  it('should not show tab content when tab content is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithStandardHeaderWithoutTabContent);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithStandardHeaderWithoutTabContent class TestTabWithStandardHeaderWithoutTabContent - inline template:1:12 caused by: tab content is mandatory');
  });

 it('should create component when all info. are supplied for tab component with standard header without icon', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithStandardHeaderWithAllData);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

   it('should create component when all info. are supplied for tab component with standard header with icon', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithStandardHeaderWithIconWithAllData);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

   it('should create component when all info. are supplied for tab component with templated header', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithTemplatedHeaderWithAllData);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

    it('should not create tab component when tab-item id and name are not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithoutTabItemIDAndName);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithoutTabItemIDAndName class TestTabWithoutTabItemIDAndName - inline template:1:12 caused by: tab-item id and name are mandatory');
  });

    it('should not work tab component when template type is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestTabWithoutTemplateType);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestTabWithoutTemplateType class TestTabWithoutTemplateType - inline template:1:12 caused by: template type is mandatory');
  });

});

/**
* Mock components for testing
* 
* @class BaseTestTabComponent
*/
class BaseTestTabComponent {  
  id: string = "tabtest";
  name: string = "tabtest";
}
@Component({
  template: `
  <ae-tab></ae-tab>`})
class TestEmptyTab extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="id"></ae-tab>`})
class TestTabWithOnlyId extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [name]="name"></ae-tab>`})
class TestTabWithOnlyName extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="id" [name]="name"></ae-tab>`})
class TestTabWithBothIdAndName extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab'" [name]="'mytabname'" [standard]="true">
                <ae-tab-item [id]="'item1'" [name]="'item1name'">                    
                    <ae-template [type]="'content'">
                        <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item [id]="'item2'" [name]="'item2name'">                    
                    <ae-template [type]="'content'">
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithStandardHeaderWithoutTabHeader extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab'" [name]="'mytabname'" [standard]="true">
                <ae-tab-item [id]="'item1'" [name]="'item1name'" [header]="'Hello - SH'">                                       
                </ae-tab-item>
                <ae-tab-item [id]="'item2'" [name]="'item2name'" [header]="'Hello! - SH'">                                        
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithStandardHeaderWithoutTabContent extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab'" [name]="'mytabname'" [standard]="true">
                <ae-tab-item [id]="'item1'" [name]="'item1name'" [header]="'Hello - SH'">                    
                   <ae-template [type]="'content'">
                        <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item [id]="'item2'" [name]="'item2name'" [header]="'Hello! - SH'">                    
                    <ae-template [type]="'content'">
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithStandardHeaderWithAllData extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab1'" [name]="'mytab1name'" [standardWithIcon]="true">
                <ae-tab-item [id]="'item11'" [name]="'item11name'" [header]="'Hello - SHWI'" [headerIcon]="'icon-bell'">                    
                    <ae-template [type]="'content'">
                       <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item [id]="'item22'" [name]="'item22name'" [header]="'Hello! - SHWI'" [headerIcon]="'icon-bank'">                    
                    <ae-template [type]="'content'">
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithStandardHeaderWithIconWithAllData extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab2'" [name]="'mytab2name'">
                <ae-tab-item [id]="'item111'" [name]="'item111name'">
                    <ae-template [type]="'header'">
                        <ng-template><span>Hello - TH</span></ng-template>
                    </ae-template>
                    <ae-template [type]="'content'">
                        <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item [id]="'item222'" [name]="'item222name'">
                    <ae-template [type]="'header'">
                        <ng-template><span>Hello! - TH</span></ng-template>
                    </ae-template>
                    <ae-template [type]="'content'">
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithTemplatedHeaderWithAllData extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab2'" [name]="'mytab2name'">
                <ae-tab-item>
                    <ae-template [type]="'header'">
                        <ng-template><span>Hello - TH</span></ng-template>
                    </ae-template>
                    <ae-template [type]="'content'">
                        <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item>
                    <ae-template [type]="'header'">
                        <ng-template><span>Hello! - TH</span></ng-template>
                    </ae-template>
                    <ae-template [type]="'content'">
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithoutTabItemIDAndName extends BaseTestTabComponent { }

@Component({
  template: `
  <ae-tab [id]="'mytab2'" [name]="'mytab2name'">
                <ae-tab-item [id]="'item111'" [name]="'item111name'">
                    <ae-template>
                        <ng-template><span>Hello - TH</span></ng-template>
                    </ae-template>
                    <ae-template>
                        <ng-template><p>World</p></ng-template>
                    </ae-template>
                </ae-tab-item>
                <ae-tab-item [id]="'item222'" [name]="'item222name'">
                    <ae-template>
                        <ng-template><span>Hello! - TH</span></ng-template>
                    </ae-template>
                    <ae-template>
                        <ng-template><p>World!</p></ng-template>
                    </ae-template>
                </ae-tab-item>
            </ae-tab>`})
class TestTabWithoutTemplateType extends BaseTestTabComponent { }